import { NextRequest, NextResponse } from 'next/server'
import { fetchTodaysEmailsWithContent } from '@/lib/google/actions'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'
import { summarizeAndStoreEmails } from '@/lib/openai/summarizeEmails'
import type { GmailMessageWithContent, SummarizedMessage } from '@/types/email'

interface AccountProcessingLog {
	id: string
	account_email: string
	userId: string
	date: string // YYYY-MM-DD
	last_processed_at: string // ISO timestamp
	emails_fetched: number
	emails_summarized: number
	digest_id?: string
	status: 'success' | 'failed' | 'no_new_emails'
}

export async function POST(request: NextRequest) {
	try {
		const { accessToken, accountEmail, userId } = await request.json()

		if (!accessToken || !accountEmail || !userId) {
			return NextResponse.json(
				{ error: 'Access token, account email, and user ID are required' },
				{ status: 400 }
			)
		}

		const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
		const currentTimestamp = new Date().toISOString()

		console.log(`🚀 Starting enhanced email summarization for ${accountEmail} (${userId})`)
		console.log(`📧 Fetching ALL today's emails with full content for comprehensive AI analysis...`)

		// Step 1: Check if account was already processed today
		const processingLog = await readJsonFile<AccountProcessingLog>('account_processing_log.json')
		const todayProcessing = processingLog.find(
			log => log.account_email === accountEmail && log.userId === userId && log.date === today
		)

		if (todayProcessing && todayProcessing.status === 'success') {
			console.log(`✅ Account ${accountEmail} already processed today`)
			return NextResponse.json({
				success: true,
				message: `Account ${accountEmail} was already processed today`,
				alreadyProcessed: true,
				lastProcessed: todayProcessing.last_processed_at,
				digestId: todayProcessing.digest_id,
				emailsSummarized: todayProcessing.emails_summarized
			})
		}

		// Step 2: Fetch ALL today's emails with full content from Gmail
		console.log(`📧 Fetching ALL today's emails with full content...`)
		const emails = await fetchTodaysEmailsWithContent(accessToken) // No maxResults limit
		
		// Log content statistics
		const contentStats = {
			totalEmails: emails.length,
			withTextContent: emails.filter(e => e.textContent).length,
			withHtmlContent: emails.filter(e => e.htmlContent).length,
			avgContentLength: emails.length > 0 
				? Math.round(emails.reduce((sum, e) => sum + (e.bodyPreview?.length || 0), 0) / emails.length)
				: 0
		}
		
		console.log(`📧 Fetched ${emails.length} emails with enhanced content`)
		console.log(`📊 Content stats:`, contentStats)

		if (emails.length === 0) {
			console.log('📭 No emails found from today')
			
			// Log the attempt
			const logEntry: AccountProcessingLog = {
				id: `${userId}_${accountEmail}_${today}`.replace(/[^a-zA-Z0-9_]/g, '_'),
				account_email: accountEmail,
				userId: userId,
				date: today,
				last_processed_at: currentTimestamp,
				emails_fetched: 0,
				emails_summarized: 0,
				status: 'no_new_emails'
			}

			const updatedLog = processingLog.filter(log => log.id !== logEntry.id)
			updatedLog.push(logEntry)
			await writeJsonFile('account_processing_log.json', updatedLog)

			return NextResponse.json({
				success: true,
				message: 'No emails found from today to process',
				emailsFetched: 0,
				emailsSummarized: 0
			})
		}

		// Step 3: Filter out already summarized messages
		console.log('🔍 Filtering out already summarized messages...')
		const summarizedMessages = await readJsonFile<SummarizedMessage>('summarized_messages.json')
		const alreadySummarizedIds = new Set(summarizedMessages.map(msg => msg.id))
		
		const newEmails = emails.filter(email => !alreadySummarizedIds.has(email.id))
		console.log(`✅ ${newEmails.length} new emails to process (${emails.length - newEmails.length} already summarized)`)

		if (newEmails.length === 0) {
			console.log('✨ All emails have already been summarized')
			
			// Log the attempt
			const logEntry: AccountProcessingLog = {
				id: `${userId}_${accountEmail}_${today}`.replace(/[^a-zA-Z0-9_]/g, '_'),
				account_email: accountEmail,
				userId: userId,
				date: today,
				last_processed_at: currentTimestamp,
				emails_fetched: emails.length,
				emails_summarized: 0,
				status: 'no_new_emails'
			}

			const updatedLog = processingLog.filter(log => log.id !== logEntry.id)
			updatedLog.push(logEntry)
			await writeJsonFile('account_processing_log.json', updatedLog)

			return NextResponse.json({
				success: true,
				message: 'All emails have already been summarized',
				emailsFetched: emails.length,
				emailsSummarized: 0,
				alreadySummarized: emails.length
			})
		}

		// Step 4: Update debug data for AI processing with enhanced content
		console.log('💾 Updating debug data with enhanced email content...')
		const existingDebugData = await readJsonFile('unsummarized_debug.json').catch(() => [])
		
		const newDebugEntry = {
			userId,
			accountEmail,
			timestamp: currentTimestamp,
			messages: newEmails,
			contentStats // Include content statistics for debugging
		}
		
		// Remove existing entry for this account and add new one
		const filteredDebugData = existingDebugData.filter((entry: any) => 
			!(entry.userId === userId && entry.accountEmail === accountEmail)
		)
		const updatedDebugData = [...filteredDebugData, newDebugEntry]
		await writeJsonFile('unsummarized_debug.json', updatedDebugData)

		// Step 5: Run AI summarization with enhanced content
		console.log('🤖 Running AI summarization with enhanced email content...')
		const summarizationResult = await summarizeAndStoreEmails(userId, accountEmail)

		if (!summarizationResult.success) {
			console.error('❌ AI summarization failed:', summarizationResult.message)
			
			// Log the failure
			const logEntry: AccountProcessingLog = {
				id: `${userId}_${accountEmail}_${today}`.replace(/[^a-zA-Z0-9_]/g, '_'),
				account_email: accountEmail,
				userId: userId,
				date: today,
				last_processed_at: currentTimestamp,
				emails_fetched: emails.length,
				emails_summarized: 0,
				status: 'failed'
			}

			const updatedLog = processingLog.filter(log => log.id !== logEntry.id)
			updatedLog.push(logEntry)
			await writeJsonFile('account_processing_log.json', updatedLog)

			return NextResponse.json({
				success: false,
				error: `AI summarization failed: ${summarizationResult.message}`
			}, { status: 400 })
		}

		// Step 6: Log successful processing
		console.log('✅ Enhanced email summarization successful!')
		console.log(`📊 Content quality: ${contentStats.withTextContent} with text, ${contentStats.withHtmlContent} with HTML`)
		
		const logEntry: AccountProcessingLog = {
			id: `${userId}_${accountEmail}_${today}`.replace(/[^a-zA-Z0-9_]/g, '_'),
			account_email: accountEmail,
			userId: userId,
			date: today,
			last_processed_at: currentTimestamp,
			emails_fetched: emails.length,
			emails_summarized: summarizationResult.processedEmails || 0,
			digest_id: summarizationResult.digestId,
			status: 'success'
		}

		const updatedLog = processingLog.filter(log => log.id !== logEntry.id)
		updatedLog.push(logEntry)
		await writeJsonFile('account_processing_log.json', updatedLog)

		return NextResponse.json({
			success: true,
			message: `Successfully processed ${newEmails.length} emails with enhanced content and created AI summary`,
			emailsFetched: emails.length,
			emailsSummarized: summarizationResult.processedEmails || 0,
			alreadySummarized: emails.length - newEmails.length,
			digestId: summarizationResult.digestId,
			processedToday: true,
			contentStats // Return content statistics to the frontend
		})

	} catch (error) {
		console.error('❌ Error in enhanced email summarization:', error)
		return NextResponse.json({
			success: false,
			error: 'Failed to complete enhanced email summarization'
		}, { status: 500 })
	}
} 