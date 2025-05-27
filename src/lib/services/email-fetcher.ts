import { fetchTodaysEmailsWithContent, fetchEmailsFromPeriod } from '@/lib/google/actions'
import { getValidCredentials } from './mailboxes'
import type { GmailMessageWithContent } from '@/types/email'
import type { EmailDataWithContent } from '@/types/google'

/**
 * Convert EmailDataWithContent to GmailMessageWithContent
 * Ensures bodyPreview is always a string (required by GmailMessageWithContent)
 */
function convertToGmailMessageWithContent(email: EmailDataWithContent): GmailMessageWithContent {
	return {
		...email,
		bodyPreview: email.bodyPreview || email.snippet || 'No content available'
	}
}

/**
 * Fetch emails for summary generation with automatic token refresh
 * 
 * @param userId - The user ID
 * @param accountId - The connected account ID
 * @param dateRange - Date range to fetch ('today' | 'initial_setup' | number of days)
 * @param maxResults - Optional limit on number of emails to fetch
 * @returns Array of emails with content
 */
export async function fetchEmailsForSummary(
	userId: string,
	accountId: string,
	dateRange: 'today' | 'initial_setup' | number = 'today',
	maxResults?: number
): Promise<{
	success: boolean
	emails: GmailMessageWithContent[]
	message: string
	emailCount: number
}> {
	try {
		console.log(`📧 Fetching emails for summary generation`)
		console.log(`👤 User: ${userId}, Account: ${accountId}`)
		console.log(`📅 Date range: ${dateRange}`)

		// Get valid credentials (with automatic refresh if needed)
		const account = await getValidCredentials(userId, accountId)
		if (!account) {
			console.error(`❌ No valid credentials found for account ${accountId}`)
			return {
				success: false,
				emails: [],
				message: 'No valid credentials found for this account',
				emailCount: 0
			}
		}

		console.log(`✅ Valid credentials obtained for ${account.email}`)

		let rawEmails: EmailDataWithContent[] = []

		// Fetch emails based on date range
		if (dateRange === 'today') {
			console.log('📅 Fetching today\'s emails...')
			rawEmails = await fetchTodaysEmailsWithContent(account.access_token, maxResults)
		} else if (dateRange === 'initial_setup') {
			console.log('📅 Fetching emails for initial setup (last 2 days)...')
			// For initial setup, fetch last 2 days as per SUMMARY_SYSTEM.md
			rawEmails = await fetchEmailsFromPeriod(account.access_token, 2, maxResults)
		} else if (typeof dateRange === 'number') {
			console.log(`📅 Fetching emails from last ${dateRange} days...`)
			rawEmails = await fetchEmailsFromPeriod(account.access_token, dateRange, maxResults)
		} else {
			throw new Error(`Invalid date range: ${dateRange}`)
		}

		// Convert to GmailMessageWithContent format
		const emails = rawEmails.map(convertToGmailMessageWithContent)

		console.log(`✅ Successfully fetched ${emails.length} emails`)

		// Log content quality statistics
		const contentStats = {
			totalEmails: emails.length,
			withTextContent: emails.filter(e => e.textContent).length,
			withHtmlContent: emails.filter(e => e.htmlContent).length,
			avgContentLength: emails.length > 0 
				? Math.round(emails.reduce((sum, e) => sum + (e.bodyPreview?.length || 0), 0) / emails.length)
				: 0
		}

		console.log(`📊 Content quality stats:`, contentStats)

		return {
			success: true,
			emails,
			message: `Successfully fetched ${emails.length} emails`,
			emailCount: emails.length
		}

	} catch (error) {
		console.error('❌ Error fetching emails for summary:', error)
		
		return {
			success: false,
			emails: [],
			message: `Failed to fetch emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
			emailCount: 0
		}
	}
}

/**
 * Fetch emails for a specific date range (for historical summaries)
 * 
 * @param userId - The user ID
 * @param accountId - The connected account ID
 * @param startDate - Start date (YYYY-MM-DD format)
 * @param endDate - End date (YYYY-MM-DD format)
 * @param maxResults - Optional limit on number of emails to fetch
 * @returns Array of emails with content
 */
export async function fetchEmailsForDateRange(
	userId: string,
	accountId: string,
	startDate: string,
	endDate: string,
	maxResults?: number
): Promise<{
	success: boolean
	emails: GmailMessageWithContent[]
	message: string
	emailCount: number
}> {
	try {
		console.log(`📧 Fetching emails for date range: ${startDate} to ${endDate}`)
		console.log(`👤 User: ${userId}, Account: ${accountId}`)

		// Get valid credentials
		const account = await getValidCredentials(userId, accountId)
		if (!account) {
			console.error(`❌ No valid credentials found for account ${accountId}`)
			return {
				success: false,
				emails: [],
				message: 'No valid credentials found for this account',
				emailCount: 0
			}
		}

		// Calculate days between dates
		const start = new Date(startDate)
		const end = new Date(endDate)
		const diffTime = Math.abs(end.getTime() - start.getTime())
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

		console.log(`📅 Fetching emails from last ${diffDays} days...`)

		// Use the period fetcher with calculated days
		const rawEmails = await fetchEmailsFromPeriod(account.access_token, diffDays, maxResults)

		// Convert to GmailMessageWithContent format
		const allEmails = rawEmails.map(convertToGmailMessageWithContent)

		// Filter emails to exact date range
		const filteredEmails = allEmails.filter(email => {
			const emailDate = new Date(email.date).toISOString().split('T')[0]
			return emailDate >= startDate && emailDate <= endDate
		})

		console.log(`✅ Fetched ${allEmails.length} emails, filtered to ${filteredEmails.length} in date range`)

		return {
			success: true,
			emails: filteredEmails,
			message: `Successfully fetched ${filteredEmails.length} emails for date range`,
			emailCount: filteredEmails.length
		}

	} catch (error) {
		console.error('❌ Error fetching emails for date range:', error)
		
		return {
			success: false,
			emails: [],
			message: `Failed to fetch emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
			emailCount: 0
		}
	}
}

/**
 * Get email count for a specific account without fetching full content
 * Useful for quick status checks
 * 
 * @param userId - The user ID
 * @param accountId - The connected account ID
 * @param dateRange - Date range to check ('today' | number of days)
 * @returns Email count information
 */
export async function getEmailCount(
	userId: string,
	accountId: string,
	dateRange: 'today' | number = 'today'
): Promise<{
	success: boolean
	count: number
	message: string
}> {
	try {
		console.log(`📊 Getting email count for ${dateRange}`)

		// For now, we'll use the full fetch and just return the count
		// In the future, we could optimize this with a Gmail API query that only returns message IDs
		const result = await fetchEmailsForSummary(userId, accountId, dateRange, 1000) // Reasonable limit for counting

		return {
			success: result.success,
			count: result.emailCount,
			message: result.success 
				? `Found ${result.emailCount} emails`
				: result.message
		}

	} catch (error) {
		console.error('❌ Error getting email count:', error)
		
		return {
			success: false,
			count: 0,
			message: `Failed to get email count: ${error instanceof Error ? error.message : 'Unknown error'}`
		}
	}
} 