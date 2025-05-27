import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { 
	generateAccountSummary, 
	generateAllAccountSummaries,
	getUserSummaryStatus 
} from '@/lib/services/summary-orchestrator'

// GET /api/summaries - Get summary status for all user accounts
export async function GET(request: NextRequest) {
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

		console.log(`📊 Getting summary status for user ${user.id}`)

		// Get summary status for all accounts
		const result = await getUserSummaryStatus(user.id)

		if (!result.success) {
			return NextResponse.json(
				{ error: 'Failed to get summary status' },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			accounts: result.accounts
		})

	} catch (error) {
		console.error('❌ Error getting summary status:', error)
		return NextResponse.json(
			{ error: 'Failed to get summary status' },
			{ status: 500 }
		)
	}
}

// POST /api/summaries - Generate summaries for user accounts
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

		const body = await request.json()
		const { 
			accountId, 
			dateRange = 'today', 
			forceRegenerate = false 
		} = body

		console.log(`🚀 Starting summary generation for user ${user.id}`)

		if (accountId) {
			// Generate summary for specific account
			console.log(`📧 Generating summary for account ${accountId}`)
			
			const result = await generateAccountSummary(
				user.id,
				accountId,
				dateRange,
				forceRegenerate
			)

			return NextResponse.json(result)
		} else {
			// Generate summaries for all accounts
			console.log(`📧 Generating summaries for all accounts`)
			
			const result = await generateAllAccountSummaries(
				user.id,
				dateRange,
				forceRegenerate
			)

			return NextResponse.json(result)
		}

	} catch (error) {
		console.error('❌ Error generating summaries:', error)
		return NextResponse.json(
			{ error: 'Failed to generate summaries' },
			{ status: 500 }
		)
	}
} 