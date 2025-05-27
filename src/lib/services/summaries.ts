import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import type { 
	EmailSummaryRow, 
	EmailSummaryInsert, 
	EmailSummaryUpdate, 
	EmailSummaryWithAccount,
	InboxStatus,
	SummaryData 
} from '@/types/email'

/**
 * Create a new email summary in the database
 * 
 * @param summaryData - The summary data to insert
 * @returns The created summary record
 */
export async function createEmailSummary(
	summaryData: EmailSummaryInsert
): Promise<EmailSummaryRow> {
	console.log(`📝 Creating email summary for user ${summaryData.user_id}, date: ${summaryData.date_processed}`)
	
	const supabase = await createClient(true) // Use service key for server operations
	
	const { data, error } = await supabase
		.from('email_summaries')
		.insert(summaryData)
		.select()
		.single()

	if (error) {
		console.error('❌ Failed to create email summary:', error)
		throw new Error(`Failed to create email summary: ${error.message}`)
	}

	console.log(`✅ Created email summary with ID: ${data.id}`)
	return data as EmailSummaryRow
}

/**
 * Get email summaries for a specific user
 * 
 * @param userId - The user ID to fetch summaries for
 * @param limit - Maximum number of summaries to return (default: 10)
 * @param accountId - Optional: filter by specific connected account ID
 * @returns Array of email summaries with account information
 */
export async function getUserEmailSummaries(
	userId: string,
	limit: number = 10,
	accountId?: string
): Promise<EmailSummaryWithAccount[]> {
	console.log(`📧 Fetching email summaries for user ${userId}${accountId ? ` (account: ${accountId})` : ''}`)
	
	const supabase = await createClient(true)
	
	let query = supabase
		.from('email_summaries')
		.select(`
			*,
			connected_accounts!inner(
				email,
				provider
			)
		`)
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit)

	// Add account filter if specified
	if (accountId) {
		query = query.eq('connected_account_id', accountId)
	}

	const { data, error } = await query

	if (error) {
		console.error('❌ Failed to fetch email summaries:', error)
		throw new Error(`Failed to fetch email summaries: ${error.message}`)
	}

	// Transform the data to include account information
	const summariesWithAccount: EmailSummaryWithAccount[] = data.map((summary: any) => ({
		...summary,
		account_email: summary.connected_accounts?.email,
		account_provider: summary.connected_accounts?.provider
	}))

	console.log(`✅ Found ${summariesWithAccount.length} email summaries`)
	return summariesWithAccount
}

/**
 * Get the latest email summary for a specific account
 * 
 * @param userId - The user ID
 * @param accountId - The connected account ID
 * @returns The latest summary or null if none found
 */
export async function getLatestAccountSummary(
	userId: string,
	accountId: string
): Promise<EmailSummaryRow | null> {
	console.log(`🔍 Fetching latest summary for account ${accountId}`)
	
	const supabase = await createClient(true)
	
	const { data, error } = await supabase
		.from('email_summaries')
		.select('*')
		.eq('user_id', userId)
		.eq('connected_account_id', accountId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		console.error('❌ Failed to fetch latest account summary:', error)
		throw new Error(`Failed to fetch latest account summary: ${error.message}`)
	}

	if (!data) {
		console.log('📭 No previous summaries found for this account')
		return null
	}

	console.log(`✅ Found latest summary from ${data.date_processed} with status: ${data.inbox_status}`)
	return data as EmailSummaryRow
}

/**
 * Check if a summary already exists for a specific account and date
 * 
 * @param userId - The user ID
 * @param accountId - The connected account ID
 * @param dateProcessed - The date to check (YYYY-MM-DD format)
 * @returns True if summary exists, false otherwise
 */
export async function summaryExistsForDate(
	userId: string,
	accountId: string,
	dateProcessed: string
): Promise<boolean> {
	console.log(`🔍 Checking if summary exists for account ${accountId} on ${dateProcessed}`)
	
	const supabase = await createClient(true)
	
	const { data, error } = await supabase
		.from('email_summaries')
		.select('id')
		.eq('user_id', userId)
		.eq('connected_account_id', accountId)
		.eq('date_processed', dateProcessed)
		.limit(1)
		.maybeSingle()

	if (error) {
		console.error('❌ Failed to check summary existence:', error)
		throw new Error(`Failed to check summary existence: ${error.message}`)
	}

	const exists = !!data
	console.log(`${exists ? '✅' : '📭'} Summary ${exists ? 'exists' : 'does not exist'} for ${dateProcessed}`)
	return exists
}

/**
 * Update an existing email summary
 * 
 * @param summaryId - The summary ID to update
 * @param updateData - The data to update
 * @returns The updated summary record
 */
export async function updateEmailSummary(
	summaryId: string,
	updateData: EmailSummaryUpdate
): Promise<EmailSummaryRow> {
	console.log(`📝 Updating email summary ${summaryId}`)
	
	const supabase = await createClient(true)
	
	const { data, error } = await supabase
		.from('email_summaries')
		.update(updateData)
		.eq('id', summaryId)
		.select()
		.single()

	if (error) {
		console.error('❌ Failed to update email summary:', error)
		throw new Error(`Failed to update email summary: ${error.message}`)
	}

	console.log(`✅ Updated email summary ${summaryId}`)
	return data as EmailSummaryRow
}

/**
 * Delete an email summary
 * 
 * @param summaryId - The summary ID to delete
 * @param userId - The user ID (for security check)
 */
export async function deleteEmailSummary(
	summaryId: string,
	userId: string
): Promise<void> {
	console.log(`🗑️ Deleting email summary ${summaryId}`)
	
	const supabase = await createClient(true)
	
	const { error } = await supabase
		.from('email_summaries')
		.delete()
		.eq('id', summaryId)
		.eq('user_id', userId) // Security check

	if (error) {
		console.error('❌ Failed to delete email summary:', error)
		throw new Error(`Failed to delete email summary: ${error.message}`)
	}

	console.log(`✅ Deleted email summary ${summaryId}`)
}

/**
 * Get summary statistics for a user
 * 
 * @param userId - The user ID
 * @param days - Number of days to look back (default: 30)
 * @returns Summary statistics
 */
export async function getUserSummaryStats(
	userId: string,
	days: number = 30
): Promise<{
	totalSummaries: number
	attentionNeeded: number
	worthALook: number
	allClear: number
	avgEmailsPerDay: number
}> {
	console.log(`📊 Fetching summary stats for user ${userId} (last ${days} days)`)
	
	const supabase = await createClient(true)
	
	// Calculate date range
	const endDate = new Date()
	const startDate = new Date()
	startDate.setDate(endDate.getDate() - days)
	
	const { data, error } = await supabase
		.from('email_summaries')
		.select('inbox_status, email_count')
		.eq('user_id', userId)
		.gte('created_at', startDate.toISOString())
		.lte('created_at', endDate.toISOString())

	if (error) {
		console.error('❌ Failed to fetch summary stats:', error)
		throw new Error(`Failed to fetch summary stats: ${error.message}`)
	}

	// Calculate statistics from inbox_status field
	let attentionNeeded = 0
	let worthALook = 0
	let allClear = 0
	
	data.forEach(summary => {
		switch (summary.inbox_status) {
			case 'attention_needed':
				attentionNeeded++
				break
			case 'worth_a_look':
				worthALook++
				break
			case 'all_clear':
				allClear++
				break
		}
	})

	const totalSummaries = data.length
	const totalEmails = data.reduce((sum, s) => sum + (s.email_count || 0), 0)
	const avgEmailsPerDay = totalSummaries > 0 ? Math.round(totalEmails / totalSummaries) : 0

	const stats = {
		totalSummaries,
		attentionNeeded,
		worthALook,
		allClear,
		avgEmailsPerDay
	}

	console.log(`✅ Summary stats:`, stats)
	return stats
}

/**
 * Mark a summary as sent via notification
 * 
 * @param summaryId - The summary ID
 * @param sentVia - The delivery method ('email' | 'whatsapp')
 * @param deliveryStatus - The delivery status ('sent' | 'failed' | 'pending')
 */
export async function markSummaryAsSent(
	summaryId: string,
	sentVia: 'email' | 'whatsapp',
	deliveryStatus: 'sent' | 'failed' | 'pending' = 'sent'
): Promise<void> {
	console.log(`📤 Marking summary ${summaryId} as ${deliveryStatus} via ${sentVia}`)
	
	const updateData: EmailSummaryUpdate = {
		sent_via: sentVia,
		delivery_status: deliveryStatus,
		sent_at: deliveryStatus === 'sent' ? new Date().toISOString() : undefined
	}

	await updateEmailSummary(summaryId, updateData)
	console.log(`✅ Marked summary as ${deliveryStatus}`)
} 