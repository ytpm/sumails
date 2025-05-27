import { fetchEmailsForSummary } from './email-fetcher'
import { generateEmailSummary } from './summary-generator'
import { 
	getLatestAccountSummary, 
	summaryExistsForDate
} from './summaries'
import { getUserMailboxes as getMailboxes } from './mailboxes'
import type { InboxStatus } from '@/types/email'

/**
 * Generate summary for a single account
 * This is the main function that orchestrates the entire summary process
 * 
 * @param userId - The user ID
 * @param accountId - The connected account ID
 * @param dateRange - Date range to process ('today' | 'initial_setup' | number of days)
 * @param forceRegenerate - Whether to regenerate if summary already exists
 * @returns Summary generation result
 */
export async function generateAccountSummary(
	userId: string,
	accountId: string,
	dateRange: 'today' | 'initial_setup' | number = 'today',
	forceRegenerate: boolean = false
): Promise<{
	success: boolean
	message: string
	summaryId?: string
	inboxStatus?: InboxStatus
	emailCount: number
	alreadyExists?: boolean
}> {
	try {
		console.log(`🚀 Starting summary generation for account ${accountId}`)
		console.log(`📅 Date range: ${dateRange}, Force regenerate: ${forceRegenerate}`)

		// Determine the date being processed
		const dateProcessed = dateRange === 'today' 
			? new Date().toISOString().split('T')[0]
			: new Date().toISOString().split('T')[0] // For now, always use today's date

		// Check if summary already exists (unless force regenerating)
		if (!forceRegenerate) {
			const exists = await summaryExistsForDate(userId, accountId, dateProcessed)
			if (exists) {
				console.log(`✅ Summary already exists for ${dateProcessed}`)
				return {
					success: true,
					message: `Summary already exists for ${dateProcessed}`,
					emailCount: 0,
					alreadyExists: true
				}
			}
		}

		// Step 1: Fetch emails
		console.log('📧 Fetching emails...')
		const emailResult = await fetchEmailsForSummary(userId, accountId, dateRange)
		
		if (!emailResult.success) {
			console.error('❌ Failed to fetch emails:', emailResult.message)
			return {
				success: false,
				message: `Failed to fetch emails: ${emailResult.message}`,
				emailCount: 0
			}
		}

		console.log(`✅ Fetched ${emailResult.emails.length} emails`)

		// Step 2: Generate AI summary
		console.log('🤖 Generating AI summary...')
		const summaryResult = await generateEmailSummary(
			userId,
			accountId,
			emailResult.emails,
			dateProcessed,
			forceRegenerate
		)

		if (!summaryResult.success) {
			console.error('❌ Failed to generate summary:', summaryResult.message)
			return {
				success: false,
				message: `Failed to generate summary: ${summaryResult.message}`,
				emailCount: emailResult.emails.length
			}
		}

		console.log('✅ Summary generation completed successfully!')
		console.log(`📊 Summary ID: ${summaryResult.summaryId}`)
		console.log(`📊 Inbox Status: ${summaryResult.inboxStatus}`)

		return {
			success: true,
			message: summaryResult.message,
			summaryId: summaryResult.summaryId,
			inboxStatus: summaryResult.inboxStatus,
			emailCount: summaryResult.emailCount
		}

	} catch (error) {
		console.error('❌ Error in generateAccountSummary:', error)
		return {
			success: false,
			message: `Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			emailCount: 0
		}
	}
}

/**
 * Generate summaries for all connected accounts of a user
 * Useful for daily CRON jobs
 * 
 * @param userId - The user ID
 * @param dateRange - Date range to process ('today' | 'initial_setup' | number of days)
 * @param forceRegenerate - Whether to regenerate if summaries already exist
 * @returns Results for all accounts
 */
export async function generateAllAccountSummaries(
	userId: string,
	dateRange: 'today' | 'initial_setup' | number = 'today',
	forceRegenerate: boolean = false
): Promise<{
	success: boolean
	message: string
	totalAccounts: number
	successfulAccounts: number
	results: Array<{
		accountId: string
		accountEmail: string
		success: boolean
		message: string
		summaryId?: string
		inboxStatus?: InboxStatus
		emailCount: number
		error?: string
	}>
}> {
	try {
		console.log(`🚀 Starting summary generation for all accounts of user ${userId}`)
		console.log(`📅 Date range: ${dateRange}, Force regenerate: ${forceRegenerate}`)

		// Get all connected mailboxes for the user
		const mailboxes = await getMailboxes(userId)
		
		if (mailboxes.length === 0) {
			console.log('📭 No connected mailboxes found')
			return {
				success: true,
				message: 'No connected mailboxes found',
				totalAccounts: 0,
				successfulAccounts: 0,
				results: []
			}
		}

		console.log(`📧 Found ${mailboxes.length} connected mailboxes`)

		const results = []
		let successfulAccounts = 0

		// Process each account
		for (const mailbox of mailboxes) {
			console.log(`\n🔄 Processing account: ${mailbox.email}`)
			
			try {
				const result = await generateAccountSummary(
					userId,
					mailbox.id,
					dateRange,
					forceRegenerate
				)

				results.push({
					accountId: mailbox.id,
					accountEmail: mailbox.email,
					success: result.success,
					message: result.message,
					summaryId: result.summaryId,
					inboxStatus: result.inboxStatus,
					emailCount: result.emailCount
				})

				if (result.success) {
					successfulAccounts++
				}

			} catch (error) {
				console.error(`❌ Error processing account ${mailbox.email}:`, error)
				results.push({
					accountId: mailbox.id,
					accountEmail: mailbox.email,
					success: false,
					message: 'Processing failed',
					emailCount: 0,
					error: error instanceof Error ? error.message : 'Unknown error'
				})
			}
		}

		console.log(`\n✅ Completed processing all accounts`)
		console.log(`📊 Summary: ${successfulAccounts}/${mailboxes.length} accounts processed successfully`)

		return {
			success: true,
			message: `Processed ${successfulAccounts}/${mailboxes.length} accounts successfully`,
			totalAccounts: mailboxes.length,
			successfulAccounts,
			results
		}

	} catch (error) {
		console.error('❌ Error in generateAllAccountSummaries:', error)
		return {
			success: false,
			message: `Failed to process accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
			totalAccounts: 0,
			successfulAccounts: 0,
			results: []
		}
	}
}

/**
 * Trigger summary generation when a new mailbox is connected
 * This implements the "immediate summary on connection" requirement
 * 
 * @param userId - The user ID
 * @param accountId - The newly connected account ID
 * @returns Summary generation result
 */
export async function triggerInitialSummary(
	userId: string,
	accountId: string
): Promise<{
	success: boolean
	message: string
	summaryId?: string
	inboxStatus?: InboxStatus
	emailCount: number
}> {
	console.log(`🔌 Triggering initial summary for newly connected account ${accountId}`)
	
	// Generate summary for initial setup (last 24-48 hours as per SUMMARY_SYSTEM.md)
	return await generateAccountSummary(
		userId,
		accountId,
		'initial_setup', // This fetches last 2 days
		false // Don't force regenerate for initial summary
	)
}

/**
 * Get summary status for all user accounts
 * Useful for dashboard display
 * 
 * @param userId - The user ID
 * @returns Summary status for all accounts
 */
export async function getUserSummaryStatus(
	userId: string
): Promise<{
	success: boolean
	accounts: Array<{
		accountId: string
		accountEmail: string
		lastSummaryDate?: string
		lastSummaryStatus?: InboxStatus
		hasRecentSummary: boolean
	}>
}> {
	try {
		console.log(`📊 Getting summary status for user ${userId}`)

		// Get all connected mailboxes
		const mailboxes = await getMailboxes(userId)
		
		const accounts = []

		for (const mailbox of mailboxes) {
			// Get latest summary for this account
			const latestSummary = await getLatestAccountSummary(userId, mailbox.id)
			
			const today = new Date().toISOString().split('T')[0]
			const hasRecentSummary = latestSummary?.date_processed === today

			accounts.push({
				accountId: mailbox.id,
				accountEmail: mailbox.email,
				lastSummaryDate: latestSummary?.date_processed || undefined,
				lastSummaryStatus: (latestSummary?.inbox_status as InboxStatus) || undefined,
				hasRecentSummary
			})
		}

		console.log(`✅ Retrieved summary status for ${accounts.length} accounts`)

		return {
			success: true,
			accounts
		}

	} catch (error) {
		console.error('❌ Error getting user summary status:', error)
		return {
			success: false,
			accounts: []
		}
	}
} 