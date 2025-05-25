import { NextRequest, NextResponse } from 'next/server'
import { fetchTodaysEmailsWithContent } from '@/lib/google/actions'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'
import { summarizeAndStoreEmails } from '@/lib/openai/summarizeEmails'
import { isTokenExpired, refreshAccessToken } from '@/lib/google/credentials'
import type { GmailMessageWithContent, SummarizedMessage } from '@/types/email'
import type { ConnectedAccount } from '@/types/auth'
import type { AccountProcessingLog } from '@/types/api'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		
		// Handle both old format (single account) and new format (all accounts for userId)
		if (body.accessToken && body.accountEmail && body.userId) {
			// Old format - process single account
			return await processSingleAccount(body.accessToken, body.accountEmail, body.userId)
		} else if (body.userId) {
			// New format - process all accounts for userId
			const forceReprocess = body.forceReprocess || false
			return await processAllAccountsForUser(body.userId, forceReprocess)
		} else {
			return NextResponse.json(
				{ error: 'Either (accessToken, accountEmail, userId) or just userId is required' },
				{ status: 400 }
			)
		}
	} catch (error) {
		console.error('❌ Error in email summarization:', error)
		return NextResponse.json({
			success: false,
			error: 'Failed to complete email summarization'
		}, { status: 500 })
	}
}

async function processAllAccountsForUser(userId: string, forceReprocess: boolean = false) {
	console.log(`🚀 Processing all connected accounts (ignoring userId for now, processing all accounts)`)
	if (forceReprocess) {
		console.log(`🔄 Force reprocessing enabled - will reprocess accounts even if already done today`)
	}
	
	try {
		// Load connected accounts
		const connectedAccounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
		console.log(`📂 Loaded ${connectedAccounts.length} total connected accounts`)
		
		// Debug: Log all userIds in connected accounts and check expiration
		connectedAccounts.forEach(account => {
			const expired = isTokenExpired(account)
			console.log(`📧 Account: ${account.email}, userId: ${account.userId}, isExpired: ${expired}`)
		})
		
		// Filter for ALL accounts that are not expired (regardless of userId for now)
		// In a real multi-user app, you'd filter by userId, but here all accounts belong to the same logical user
		const userAccounts = connectedAccounts.filter(account => !isTokenExpired(account))
		
		console.log(`✅ Found ${userAccounts.length} active accounts (total: ${connectedAccounts.length})`)
		
		if (userAccounts.length === 0) {
			console.error(`❌ No active accounts found. Total accounts: ${connectedAccounts.length}`)
			return NextResponse.json({
				success: false,
				error: 'No active connected accounts found'
			}, { status: 400 })
		}
		
		console.log(`📧 Found ${userAccounts.length} active accounts to process`)
		
		const results = []
		let totalEmailsFetched = 0
		let totalEmailsSummarized = 0
		let successfulAccounts = 0
		
		// Process each account
		for (const account of userAccounts) {
			console.log(`\n🔄 Processing account: ${account.email}`)
			
			try {
				// Load credentials for this account
				const credentials = await loadAccountCredentials(account.userId, account.email)
				if (!credentials?.accessToken) {
					console.error(`❌ No access token found for ${account.email}`)
					results.push({
						email: account.email,
						success: false,
						error: 'No access token found'
					})
					continue
				}
				
				// Process this account with force reprocess option
				const result = await processSingleAccountInternal(credentials.accessToken, account.email, account.userId, forceReprocess)
				results.push({
					email: account.email,
					success: result.success,
					emailsFetched: result.emailsFetched || 0,
					emailsSummarized: result.emailsSummarized || 0,
					digestId: result.digestId,
					error: result.error
				})
				
				if (result.success) {
					successfulAccounts++
					totalEmailsFetched += result.emailsFetched || 0
					totalEmailsSummarized += result.emailsSummarized || 0
				}
				
			} catch (accountError) {
				console.error(`❌ Error processing ${account.email}:`, accountError)
				results.push({
					email: account.email,
					success: false,
					error: `Processing failed: ${accountError}`
				})
			}
		}
		
		console.log(`\n✅ Completed processing all accounts`)
		console.log(`📊 Summary: ${successfulAccounts}/${userAccounts.length} accounts processed successfully`)
		console.log(`📧 Total emails fetched: ${totalEmailsFetched}`)
		console.log(`📧 Total emails summarized: ${totalEmailsSummarized}`)
		
		return NextResponse.json({
			success: true,
			message: `Processed ${successfulAccounts}/${userAccounts.length} accounts successfully`,
			totalAccounts: userAccounts.length,
			successfulAccounts,
			totalEmailsFetched,
			totalEmailsSummarized,
			results
		})
		
	} catch (error) {
		console.error('❌ Error processing all accounts:', error)
		return NextResponse.json({
			success: false,
			error: 'Failed to process accounts'
		}, { status: 500 })
	}
}

async function loadAccountCredentials(userId: string, email: string) {
	try {
		// Load credentials from connected_accounts.json
		const connectedAccounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
		const account = connectedAccounts.find((acc: ConnectedAccount) => acc.userId === userId && acc.email === email)
		
		if (account && account.accessToken) {
			console.log(`✅ Found credentials for ${email}`)
			return { accessToken: account.accessToken }
		}
		
		console.error(`❌ No credentials found for userId: ${userId}, email: ${email}`)
		return null
		
	} catch (error) {
		console.error(`❌ Error loading credentials for ${email}:`, error)
		return null
	}
}

async function processSingleAccount(accessToken: string, accountEmail: string, userId: string) {
	const result = await processSingleAccountInternal(accessToken, accountEmail, userId)
	return NextResponse.json(result)
}

async function processSingleAccountInternal(accessToken: string, accountEmail: string, userId: string, forceReprocess: boolean = false) {
	const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
	const currentTimestamp = new Date().toISOString()

	console.log(`🚀 Starting enhanced email summarization for ${accountEmail} (${userId})`)
	console.log(`📧 Fetching ALL today's emails with full content for comprehensive AI analysis...`)

	// Step 1: Check if account was already processed today
	const processingLog = await readJsonFile<AccountProcessingLog>('account_processing_log.json')
	const todayProcessing = processingLog.find(
		log => log.account_email === accountEmail && log.userId === userId && log.date === today
	)

	if (todayProcessing && todayProcessing.status === 'success' && !forceReprocess) {
		console.log(`✅ Account ${accountEmail} already processed today (use forceReprocess to override)`)
		return {
			success: true,
			message: `Account ${accountEmail} was already processed today`,
			alreadyProcessed: true,
			lastProcessed: todayProcessing.last_processed_at,
			digestId: todayProcessing.digest_id,
			emailsSummarized: todayProcessing.emails_summarized
		}
	} else if (todayProcessing && forceReprocess) {
		console.log(`🔄 Account ${accountEmail} was already processed today, but force reprocessing...`)
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

		return {
			success: true,
			message: 'No emails found from today to process',
			emailsFetched: 0,
			emailsSummarized: 0
		}
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

		return {
			success: true,
			message: 'All emails have already been summarized',
			emailsFetched: emails.length,
			emailsSummarized: 0,
			alreadySummarized: emails.length
		}
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

		return {
			success: false,
			error: `AI summarization failed: ${summarizationResult.message}`
		}
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

	return {
		success: true,
		message: `Successfully processed ${newEmails.length} emails with enhanced content and created AI summary`,
		emailsFetched: emails.length,
		emailsSummarized: summarizationResult.processedEmails || 0,
		alreadySummarized: emails.length - newEmails.length,
		digestId: summarizationResult.digestId,
		processedToday: true,
		contentStats // Return content statistics to the frontend
	}
} 