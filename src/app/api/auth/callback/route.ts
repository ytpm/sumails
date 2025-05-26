import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'
import { saveConnectedAccount, getUserInfo } from '@/lib/connected-accounts/service'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')
		const error = searchParams.get('error')
		const state = searchParams.get('state')

		// Handle OAuth errors
		if (error) {
			console.error('OAuth error:', error)
			return NextResponse.redirect(
				new URL(`/account/connected-accounts?error=${encodeURIComponent(error)}`, request.url)
			)
		}

		if (!code) {
			return NextResponse.redirect(
				new URL('/account/connected-accounts?error=missing_code', request.url)
			)
		}

		// Get the current user from Supabase
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			console.error('User not authenticated:', userError)
			return NextResponse.redirect(
				new URL('/auth/login?error=not_authenticated', request.url)
			)
		}

		// Exchange authorization code for tokens
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.NODE_ENV === 'production' 
				? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
				: 'http://localhost:3000/api/auth/callback'
		)

		const { tokens } = await oauth2Client.getToken(code)

		if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
			throw new Error('Invalid tokens received from Google')
		}

		// Get user info from Google
		const userInfo = await getUserInfo(tokens.access_token)

		// Save connected account to Supabase
		await saveConnectedAccount(user.id, tokens, userInfo)

		// Redirect to connected accounts page with success message
		return NextResponse.redirect(
			new URL('/account/connected-accounts?success=account_connected', request.url)
		)

	} catch (error) {
		console.error('OAuth callback error:', error)
		return NextResponse.redirect(
			new URL(`/account/connected-accounts?error=${encodeURIComponent('connection_failed')}`, request.url)
		)
	}
}