import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateAccountSummary } from '@/lib/services/summary-orchestrator'
import { 
	getUserEmailSummaries, 
	getLatestAccountSummary 
} from '@/lib/services/summaries'

// GET /api/summaries/[accountId] - Get summaries for a specific account
export async function GET(
	request: NextRequest,
	{ params }: { params: { accountId: string } }
) {
	try {
		const accountId = params.accountId
		
		if (!accountId) {
			return NextResponse.json(
				{ error: 'Invalid account ID' },
				{ status: 400 }
			)
		}

		// Get the current user from Supabase
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 }
			)
		}

		const { searchParams } = new URL(request.url)
		const limit = parseInt(searchParams.get('limit') || '10')
		const latest = searchParams.get('latest') === 'true'

		console.log(`📧 Getting summaries for account ${accountId}`)

		if (latest) {
			// Get only the latest summary
			const latestSummary = await getLatestAccountSummary(user.id, accountId)
			
			return NextResponse.json({
				success: true,
				summary: latestSummary
			})
		} else {
			// Get multiple summaries with pagination
			const summaries = await getUserEmailSummaries(user.id, limit, accountId)
			
			return NextResponse.json({
				success: true,
				summaries,
				count: summaries.length
			})
		}

	} catch (error) {
		console.error('❌ Error getting account summaries:', error)
		return NextResponse.json(
			{ error: 'Failed to get account summaries' },
			{ status: 500 }
		)
	}
}

// POST /api/summaries/[accountId] - Generate summary for a specific account
export async function POST(
	request: NextRequest,
	{ params }: { params: { accountId: string } }
) {
	try {
		const accountId = params.accountId
		
		if (!accountId) {
			return NextResponse.json(
				{ error: 'Invalid account ID' },
				{ status: 400 }
			)
		}

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
			dateRange = 'today', 
			forceRegenerate = false 
		} = body

		console.log(`🚀 Generating summary for account ${accountId}`)

		// Generate summary for this specific account
		const result = await generateAccountSummary(
			user.id,
			accountId,
			dateRange,
			forceRegenerate
		)

		return NextResponse.json(result)

	} catch (error) {
		console.error('❌ Error generating account summary:', error)
		return NextResponse.json(
			{ error: 'Failed to generate account summary' },
			{ status: 500 }
		)
	}
} 