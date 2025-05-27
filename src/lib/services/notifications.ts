import { createClient } from '@/utils/supabase/server'
import type { EmailSummaryRow, InboxStatus, SummaryData } from '@/types/email'
import { markSummaryAsSent } from './summaries'

/**
 * Send summary notification via WhatsApp or Email
 * 
 * @param userId - The user ID
 * @param summary - The email summary to send
 * @param method - Delivery method ('whatsapp' | 'email')
 * @returns Notification result
 */
export async function sendSummaryNotification(
	userId: string,
	summary: EmailSummaryRow,
	method: 'whatsapp' | 'email' = 'whatsapp'
): Promise<{
	success: boolean
	message: string
	deliveryMethod: 'whatsapp' | 'email'
}> {
	try {
		console.log(`📤 Sending ${method} notification for summary ${summary.id}`)

		// Get user preferences and contact info
		const userSettings = await getUserNotificationSettings(userId)
		
		if (!userSettings) {
			return {
				success: false,
				message: 'User notification settings not found',
				deliveryMethod: method
			}
		}

		// Check if user wants notifications for this method
		const wantsNotification = method === 'whatsapp' 
			? userSettings.summary_receive_by_whatsapp 
			: userSettings.summary_receive_by_email

		if (!wantsNotification) {
			console.log(`📭 User has disabled ${method} notifications`)
			return {
				success: true,
				message: `User has disabled ${method} notifications`,
				deliveryMethod: method
			}
		}

		// Format the notification message
		const notificationContent = formatSummaryNotification(summary)

		let deliveryResult: { success: boolean; message: string }

		if (method === 'whatsapp') {
			deliveryResult = await sendWhatsAppNotification(
				userSettings.whatsapp_number,
				notificationContent,
				summary
			)
		} else {
			deliveryResult = await sendEmailNotification(
				userSettings.email,
				notificationContent,
				summary
			)
		}

		// Mark summary as sent (or failed)
		await markSummaryAsSent(
			summary.id,
			method,
			deliveryResult.success ? 'sent' : 'failed'
		)

		return {
			success: deliveryResult.success,
			message: deliveryResult.message,
			deliveryMethod: method
		}

	} catch (error) {
		console.error(`❌ Error sending ${method} notification:`, error)
		
		// Mark as failed
		try {
			await markSummaryAsSent(summary.id, method, 'failed')
		} catch (markError) {
			console.error('❌ Error marking summary as failed:', markError)
		}

		return {
			success: false,
			message: `Failed to send ${method} notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
			deliveryMethod: method
		}
	}
}

/**
 * Send WhatsApp notification (enhanced console logging)
 */
async function sendWhatsAppNotification(
	phoneNumber: string | null,
	content: string,
	summary: EmailSummaryRow
): Promise<{ success: boolean; message: string }> {
	if (!phoneNumber) {
		return {
			success: false,
			message: 'No WhatsApp number configured'
		}
	}

	// Enhanced console logging with beautiful formatting
	console.log('\n' + '='.repeat(80))
	console.log('📱 WHATSAPP NOTIFICATION (CONSOLE PREVIEW)')
	console.log('='.repeat(80))
	console.log(`📞 To: ${phoneNumber}`)
	console.log(`📧 Account ID: ${summary.connected_account_id}`)
	console.log(`📅 Date: ${summary.date_processed}`)
	console.log(`📊 Status: ${summary.inbox_status?.toUpperCase()}`)
	console.log(`📈 Email Count: ${summary.email_count}`)
	console.log('─'.repeat(80))
	console.log('💬 MESSAGE CONTENT:')
	console.log('─'.repeat(80))
	console.log(content)
	console.log('─'.repeat(80))
	console.log('🔧 TECHNICAL DETAILS:')
	console.log(`   Summary ID: ${summary.id}`)
	console.log(`   User ID: ${summary.user_id}`)
	console.log(`   Created: ${summary.created_at}`)
	console.log(`   Method: WhatsApp`)
	console.log('='.repeat(80))
	console.log('✅ WhatsApp notification logged to console (placeholder implementation)')
	console.log('='.repeat(80) + '\n')

	// TODO: Implement actual WhatsApp sending via Twilio or similar
	// Example implementation:
	// const client = twilio(accountSid, authToken)
	// await client.messages.create({
	//   body: content,
	//   from: 'whatsapp:+14155238886',
	//   to: `whatsapp:${phoneNumber}`
	// })
	
	return {
		success: true,
		message: 'WhatsApp notification logged to console (placeholder)'
	}
}

/**
 * Send Email notification (enhanced console logging)
 */
async function sendEmailNotification(
	email: string | null,
	content: string,
	summary: EmailSummaryRow
): Promise<{ success: boolean; message: string }> {
	if (!email) {
		return {
			success: false,
			message: 'No email address configured'
		}
	}

	const summaryData = summary.summary_data as unknown as SummaryData
	const subject = `📬 Daily Email Summary - ${summary.inbox_status?.toUpperCase()}`

	// Enhanced console logging with beautiful formatting
	console.log('\n' + '='.repeat(80))
	console.log('📧 EMAIL NOTIFICATION (CONSOLE PREVIEW)')
	console.log('='.repeat(80))
	console.log(`📮 To: ${email}`)
	console.log(`📧 Account ID: ${summary.connected_account_id}`)
	console.log(`📅 Date: ${summary.date_processed}`)
	console.log(`📊 Status: ${summary.inbox_status?.toUpperCase()}`)
	console.log(`📈 Email Count: ${summary.email_count}`)
	console.log('─'.repeat(80))
	console.log('📝 EMAIL DETAILS:')
	console.log(`   Subject: ${subject}`)
	console.log(`   From: noreply@sumails.com`)
	console.log(`   Reply-To: support@sumails.com`)
	console.log('─'.repeat(80))
	console.log('💌 EMAIL CONTENT:')
	console.log('─'.repeat(80))
	console.log(content)
	console.log('─'.repeat(80))
	console.log('📋 STRUCTURED DATA:')
	console.log(`   Overview: ${summaryData.overview.join(', ')}`)
	console.log(`   Insight: ${summaryData.insight}`)
	console.log(`   Important Emails: ${summaryData.important_emails.length}`)
	console.log(`   Suggestions: ${summaryData.suggestions?.length || 0}`)
	console.log('─'.repeat(80))
	console.log('🔧 TECHNICAL DETAILS:')
	console.log(`   Summary ID: ${summary.id}`)
	console.log(`   User ID: ${summary.user_id}`)
	console.log(`   Created: ${summary.created_at}`)
	console.log(`   Method: Email`)
	console.log('='.repeat(80))
	console.log('✅ Email notification logged to console (placeholder implementation)')
	console.log('='.repeat(80) + '\n')

	// TODO: Implement actual email sending via SendGrid, Resend, or similar
	// Example implementation:
	// await sendgrid.send({
	//   to: email,
	//   from: 'noreply@sumails.com',
	//   subject: subject,
	//   text: content,
	//   html: convertToHtml(content)
	// })
	
	return {
		success: true,
		message: 'Email notification logged to console (placeholder)'
	}
}

/**
 * Format summary data into a readable notification message
 */
function formatSummaryNotification(summary: EmailSummaryRow): string {
	const summaryData = summary.summary_data as unknown as SummaryData
	const status = summary.inbox_status as InboxStatus
	
	// Get status emoji
	const statusEmoji = {
		'attention_needed': '🔥',
		'worth_a_look': '👀',
		'all_clear': '✅'
	}[status] || '📬'

	// Format the message based on SUMMARY_SYSTEM.md example
	let message = `${statusEmoji} ${summaryData.overview.join(' ')}\n\n`
	
	// Add insight
	message += `💡 ${summaryData.insight}\n\n`
	
	// Add important emails if any
	if (summaryData.important_emails.length > 0) {
		message += '📋 Important emails:\n'
		summaryData.important_emails.slice(0, 5).forEach(email => {
			message += `• ${email.subject} (from ${email.sender})\n`
		})
		message += '\n'
	}
	
	// Add suggestions if any
	if (summaryData.suggestions && summaryData.suggestions.length > 0) {
		message += `💡 Tip: ${summaryData.suggestions[0]}\n\n`
	}
	
	// Add status message
	const statusMessages = {
		'attention_needed': '⚠️ Action needed on some emails.',
		'worth_a_look': '👀 Some emails worth reviewing.',
		'all_clear': '✅ You\'re all caught up!'
	}
	
	message += statusMessages[status] || '📬 Summary complete.'
	
	return message
}

/**
 * Get user notification settings
 */
async function getUserNotificationSettings(userId: string) {
	const supabase = await createClient(true)
	
	const { data, error } = await supabase
		.from('user_settings')
		.select(`
			summary_receive_by_whatsapp,
			summary_receive_by_email
		`)
		.eq('user_id', userId)
		.single()

	if (error) {
		console.error('❌ Failed to get user notification settings:', error)
		return null
	}

	// Also get user profile for contact info
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('whatsapp_number')
		.eq('id', userId)
		.single()

	if (profileError) {
		console.error('❌ Failed to get user profile:', profileError)
		return null
	}

	// Get user email from auth
	const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)
	
	if (userError || !user) {
		console.error('❌ Failed to get user email:', userError)
		return null
	}

	return {
		...data,
		whatsapp_number: profile.whatsapp_number || null,
		email: user.email || null
	}
}

/**
 * Send notifications for summaries that need attention
 * Called by CRON job or after summary generation
 */
export async function sendNotificationsForSummaries(
	userId: string,
	summaries: EmailSummaryRow[]
): Promise<{
	success: boolean
	sent: number
	failed: number
	skipped: number
}> {
	let sent = 0
	let failed = 0
	let skipped = 0

	console.log(`📱 Processing notifications for ${summaries.length} summaries`)

	for (const summary of summaries) {
		const status = summary.inbox_status as InboxStatus
		
		// Only send notifications for summaries that need attention
		if (status === 'attention_needed' || status === 'worth_a_look') {
			try {
				console.log(`📤 Sending notification for summary ${summary.id} (${status})`)
				const result = await sendSummaryNotification(userId, summary, 'whatsapp')
				
				if (result.success) {
					sent++
					console.log(`✅ Notification sent successfully for summary ${summary.id}`)
				} else {
					failed++
					console.log(`❌ Notification failed for summary ${summary.id}: ${result.message}`)
				}
			} catch (error) {
				console.error(`❌ Error sending notification for summary ${summary.id}:`, error)
				failed++
			}
		} else {
			skipped++
			console.log(`⏭️ Skipping notification for summary ${summary.id} (${status})`)
		}
	}

	console.log(`📊 Notification results: ${sent} sent, ${failed} failed, ${skipped} skipped`)

	return {
		success: failed === 0,
		sent,
		failed,
		skipped
	}
}

/**
 * Enhanced notification testing function
 */
export async function testNotificationSystem(
	userId: string,
	accountId: string,
	method: 'whatsapp' | 'email' = 'whatsapp'
): Promise<{
	success: boolean
	message: string
	previewGenerated: boolean
}> {
	try {
		console.log(`🧪 Testing notification system for user ${userId}, account ${accountId}`)

		// Get the latest summary for this account
		const supabase = await createClient(true)
		const { data: summary, error } = await supabase
			.from('email_summaries')
			.select(`
				*,
				connected_accounts!inner(email, provider)
			`)
			.eq('user_id', userId)
			.eq('connected_account_id', accountId)
			.order('created_at', { ascending: false })
			.limit(1)
			.single()

		if (error || !summary) {
			return {
				success: false,
				message: 'No summary found for this account. Generate a summary first.',
				previewGenerated: false
			}
		}

		// Send test notification
		const result = await sendSummaryNotification(userId, summary, method)

		return {
			success: result.success,
			message: result.message,
			previewGenerated: true
		}

	} catch (error) {
		console.error('❌ Error testing notification system:', error)
		return {
			success: false,
			message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			previewGenerated: false
		}
	}
} 