import { NextRequest, NextResponse } from 'next/server'
import { setGmailCredentials } from '@/lib/google/actions'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')
		const error = searchParams.get('error')

		if (error) {
			console.error('OAuth error:', error)
			return NextResponse.redirect('/auth?error=oauth_error')
		}

		if (!code) {
			console.error('No authorization code received')
			return NextResponse.redirect('/auth?error=no_code')
		}

		// Exchange authorization code for tokens
		const tokens = await setGmailCredentials(code)

		// In a real application, you would securely store these tokens
		// For this demo, we'll redirect with the access token
		// NOTE: This is not secure for production - use secure session storage instead
		const redirectUrl = new URL('/dashboard', request.url)
		redirectUrl.searchParams.set('access_token', tokens.access_token!)
		
		return NextResponse.redirect(redirectUrl.toString())
	} catch (error) {
		console.error('Error in OAuth callback:', error)
		return NextResponse.redirect('/auth?error=callback_error')
	}
}