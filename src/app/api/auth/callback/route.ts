import { NextRequest, NextResponse } from 'next/server'
import { setGmailCredentials } from '@/lib/google/actions'
import { saveCredentials, getUserInfo } from '@/lib/google/credentials'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')
		const error = searchParams.get('error')

		console.log(`🔗 OAuth callback received: code=${code}, error=${error}`)

		if (error) {
			console.error('OAuth error:', error)
			return NextResponse.redirect(new URL('/auth?error=oauth_error', request.url))
		}

		if (!code) {
			console.error('No authorization code received')
			return NextResponse.redirect(new URL('/auth?error=no_code', request.url))
		}

		// Exchange authorization code for tokens
		const tokens = await setGmailCredentials(code)
		console.log('🔑 Received tokens:', {
			access_token: tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'null',
			refresh_token: tokens.refresh_token ? 'present' : 'null',
			expiry_date: tokens.expiry_date,
			scope: tokens.scope
		})
		
		if (!tokens.access_token) {
			console.error('No access token received')
			return NextResponse.redirect(new URL('/auth?error=no_token', request.url))
		}

		// Get user info from Google
		console.log('📋 Getting user info with access token...')
		const userInfo = await getUserInfo(tokens.access_token)
		
		// Save credentials to JSON file
		await saveCredentials(tokens, userInfo)
		
		// Redirect to dashboard with success
		const redirectUrl = new URL('/dashboard', request.url)
		redirectUrl.searchParams.set('connected', 'success')
		redirectUrl.searchParams.set('email', userInfo.email)
		
		return NextResponse.redirect(redirectUrl.toString())
	} catch (error) {
		console.error('Error in OAuth callback:', error)
		return NextResponse.redirect(new URL('/auth?error=callback_error', request.url))
	}
}