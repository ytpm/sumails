import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'
import { saveConnectedAccount, getUserInfo } from '@/lib/services/mailboxes'
import { triggerInitialSummary } from '@/lib/services/summary-orchestrator'

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
				new URL(`/account/mailboxes?error=${encodeURIComponent(error)}`, request.url)
			)
		}

		if (!code) {
			return NextResponse.redirect(
				new URL('/account/mailboxes?error=missing_code', request.url)
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
		const connectedAccount = await saveConnectedAccount(user.id, tokens, userInfo)

		// 🔌 TRIGGER INITIAL SUMMARY (as per SUMMARY_SYSTEM.md)
		// Generate summary immediately after mailbox connection
		console.log(`🔌 Triggering initial summary for newly connected account: ${userInfo.email}`)
		
		try {
			const summaryResult = await triggerInitialSummary(user.id, connectedAccount.id)
			
			if (summaryResult.success) {
				console.log(`✅ Initial summary generated successfully for ${userInfo.email}`)
				console.log(`📊 Summary ID: ${summaryResult.summaryId}, Status: ${summaryResult.inboxStatus}`)
				
				// TODO: Send notification based on inbox status
				// if (summaryResult.inboxStatus === 'attention_needed' || summaryResult.inboxStatus === 'worth_a_look') {
				//     await sendSummaryNotification(user.id, summaryResult)
				// }
			} else {
				console.error(`❌ Failed to generate initial summary for ${userInfo.email}:`, summaryResult.message)
			}
		} catch (summaryError) {
			// Don't fail the entire connection process if summary fails
			console.error(`❌ Error generating initial summary for ${userInfo.email}:`, summaryError)
		}

		// Redirect to connected accounts page with success message
		return NextResponse.redirect(
			new URL('/account/mailboxes?success=account_connected', request.url)
		)

	} catch (error) {
		console.error('OAuth callback error:', error)
		return NextResponse.redirect(
			new URL(`/account/mailboxes?error=${encodeURIComponent('connection_failed')}`, request.url)
		)
	}
}