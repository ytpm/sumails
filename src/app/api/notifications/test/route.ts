import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { testNotificationSystem } from '@/lib/services/notifications'

// POST /api/notifications/test - Test notification system
export async function POST(request: NextRequest) {
	try {
		// Get the current user
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'Not authenticated' },
				{ status: 401 }
			)
		}

		// Parse request body
		const body = await request.json()
		const { accountId, method = 'whatsapp' } = body

		if (!accountId) {
			return NextResponse.json(
				{ error: 'Account ID is required' },
				{ status: 400 }
			)
		}

		console.log(`🧪 Testing notification system for user ${user.id}, account ${accountId}`)

		// Test the notification system
		const result = await testNotificationSystem(user.id, accountId, method)

		if (!result.success) {
			return NextResponse.json(
				{ 
					error: result.message,
					previewGenerated: result.previewGenerated
				},
				{ status: 400 }
			)
		}

		return NextResponse.json({
			success: true,
			message: result.message,
			deliveryMethod: method,
			previewGenerated: result.previewGenerated,
			testMode: true
		})

	} catch (error) {
		console.error('❌ Error in test notification endpoint:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function GET(request: NextRequest) {
	try {
		// Get the current user
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'Not authenticated' },
				{ status: 401 }
			)
		}

		// Get all connected accounts for testing
		const { data: accounts, error: accountsError } = await supabase
			.from('connected_accounts')
			.select('id, email, provider')
			.eq('user_id', user.id)

		if (accountsError) {
			return NextResponse.json(
				{ error: 'Failed to fetch accounts' },
				{ status: 500 }
			)
		}

		// Get summary counts for each account
		const accountsWithSummaries = await Promise.all(
			accounts.map(async (account) => {
				const { data: summaries, error } = await supabase
					.from('email_summaries')
					.select('id, inbox_status, date_processed')
					.eq('connected_account_id', account.id)
					.order('created_at', { ascending: false })
					.limit(1)

				return {
					...account,
					latestSummary: summaries?.[0] || null,
					hasSummary: summaries && summaries.length > 0
				}
			})
		)

		return NextResponse.json({
			success: true,
			message: 'Available accounts for notification testing',
			accounts: accountsWithSummaries,
			testInstructions: {
				whatsapp: 'POST /api/notifications/test with { "accountId": "uuid", "method": "whatsapp" }',
				email: 'POST /api/notifications/test with { "accountId": "uuid", "method": "email" }'
			}
		})

	} catch (error) {
		console.error('❌ Error in test notification GET endpoint:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 