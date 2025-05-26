import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getUserMailboxes, isTokenExpired, refreshAccessToken } from '@/lib/services/mailboxes'

// POST /api/mailboxes/refresh-tokens - Refresh all expired tokens for user's mailboxes
export async function POST(request: NextRequest) {
	try {
		// Get the current user from Supabase
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 }
			)
		}

		// Get all user's mailboxes
		const mailboxes = await getUserMailboxes(user.id)
		
		const refreshResults = []
		let refreshedCount = 0
		let errorCount = 0

		// Check and refresh expired tokens
		for (const mailbox of mailboxes) {
			try {
				if (isTokenExpired(mailbox)) {
					console.log(`🔄 Refreshing expired token for ${mailbox.email}`)
					await refreshAccessToken(mailbox)
					refreshedCount++
					refreshResults.push({
						email: mailbox.email,
						status: 'refreshed',
						message: 'Token refreshed successfully'
					})
				} else {
					refreshResults.push({
						email: mailbox.email,
						status: 'valid',
						message: 'Token is still valid'
					})
				}
			} catch (error) {
				console.error(`❌ Failed to refresh token for ${mailbox.email}:`, error)
				errorCount++
				refreshResults.push({
					email: mailbox.email,
					status: 'error',
					message: error instanceof Error ? error.message : 'Failed to refresh token'
				})
			}
		}

		return NextResponse.json({
			success: true,
			refreshedCount,
			errorCount,
			totalMailboxes: mailboxes.length,
			results: refreshResults
		})

	} catch (error) {
		console.error('Error refreshing tokens:', error)
		return NextResponse.json(
			{ error: 'Failed to refresh tokens' },
			{ status: 500 }
		)
	}
} 