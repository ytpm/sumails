import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateAllAccountSummaries } from '@/lib/services/summary-orchestrator'
import { logger } from '@/lib/logger/default-logger'

// POST /api/cron/daily-summaries - Daily CRON job for generating summaries
export async function POST(request: NextRequest) {
	logger.debug('CRON-DAILY-SUMMARIES', 'POST', 'Starting daily summary CRON job')
	try {
		// Verify this is a legitimate CRON request
		const authHeader = request.headers.get('authorization')
		const cronSecret = process.env.CRON_SECRET

		if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
			logger.error('CRON-DAILY-SUMMARIES', 'POST', 'Unauthorized CRON request')
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		logger.debug('CRON-DAILY-SUMMARIES', 'POST', 'Starting daily summary CRON job')
		const startTime = Date.now()

		// Get all users from the database
		const supabase = await createClient(true) // Use service key
		
		const { data: users, error: usersError } = await supabase
			.from('profiles')
			.select('id')

		if (usersError) {
			logger.error('CRON-DAILY-SUMMARIES', 'POST', 'Failed to fetch users:', usersError)
			return NextResponse.json(
				{ error: 'Failed to fetch users' },
				{ status: 500 }
			)
		}

		logger.debug('CRON-DAILY-SUMMARIES', 'POST', `Found ${users.length} users to process`)

		const results = []
		let totalSuccessfulUsers = 0
		let totalAccountsProcessed = 0
		let totalEmailsProcessed = 0

		// Process each user
		for (const user of users) {
			logger.debug('CRON-DAILY-SUMMARIES', 'POST', `Processing user: ${user.id}`)
			
			try {
				const userResult = await generateAllAccountSummaries(
					user.id,
					'today', // Generate summaries for today
					false // Don't force regenerate (skip if already done today)
				)

				results.push({
					userId: user.id,
					success: userResult.success,
					message: userResult.message,
					totalAccounts: userResult.totalAccounts,
					successfulAccounts: userResult.successfulAccounts,
					results: userResult.results
				})

				if (userResult.success) {
					totalSuccessfulUsers++
					totalAccountsProcessed += userResult.successfulAccounts
					
					// Count total emails processed
					userResult.results.forEach(result => {
						totalEmailsProcessed += result.emailCount || 0
					})

					logger.debug('CRON-DAILY-SUMMARIES', 'POST', `User ${user.id}: ${userResult.successfulAccounts}/${userResult.totalAccounts} accounts processed`)
				} else {
					logger.error('CRON-DAILY-SUMMARIES', 'POST', `User ${user.id}: ${userResult.message}`)
				}

			} catch (userError) {
				logger.error('CRON-DAILY-SUMMARIES', 'POST', `Error processing user ${user.id}:`, userError)
				results.push({
					userId: user.id,
					success: false,
					message: `Processing failed: ${userError instanceof Error ? userError.message : 'Unknown error'}`,
					totalAccounts: 0,
					successfulAccounts: 0,
					results: []
				})
			}
		}

		const endTime = Date.now()
		const duration = Math.round((endTime - startTime) / 1000)

		logger.debug('CRON-DAILY-SUMMARIES', 'POST', `Daily summary CRON job completed`)
		logger.debug('CRON-DAILY-SUMMARIES', 'POST', `Duration: ${duration} seconds`)
		logger.debug('CRON-DAILY-SUMMARIES', 'POST', `Users processed: ${totalSuccessfulUsers}/${users.length}`)
		logger.debug('CRON-DAILY-SUMMARIES', 'POST', `Accounts processed: ${totalAccountsProcessed}`)
		logger.debug('CRON-DAILY-SUMMARIES', 'POST', `Emails processed: ${totalEmailsProcessed}`)

		// TODO: Send notifications for summaries that need attention
		// TODO: Log CRON job results to monitoring system

		return NextResponse.json({
			success: true,
			message: `Daily summaries completed in ${duration}s`,
			stats: {
				duration,
				totalUsers: users.length,
				successfulUsers: totalSuccessfulUsers,
				totalAccountsProcessed,
				totalEmailsProcessed
			},
			results
		})

	} catch (error) {
		logger.error('CRON-DAILY-SUMMARIES', 'POST', 'Error in daily summary CRON job:', error)
		return NextResponse.json(
			{ error: 'CRON job failed' },
			{ status: 500 }
		)
	}
}

// GET /api/cron/daily-summaries - Health check for CRON endpoint
export async function GET(request: NextRequest) {
	logger.debug('CRON-DAILY-SUMMARIES', 'GET', 'Health check for daily summary CRON endpoint')
	return NextResponse.json({
		success: true,
		message: 'Daily summaries CRON endpoint is healthy',
		timestamp: new Date().toISOString()
	})
} 