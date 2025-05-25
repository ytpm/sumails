import { NextRequest, NextResponse } from 'next/server'
import { setGmailCredentials } from '@/lib/google/actions'
import { saveCredentials, getUserInfo } from '@/lib/google/credentials'
import { fetchTodaysEmailsWithContent } from '@/lib/google/actions'
import { summarizeAndStoreEmails } from '@/lib/openai/summarizeEmails'
import { writeJsonFile, readJsonFile } from '@/lib/json_handler'
import type { GmailMessageWithContent, SummarizedMessage, EmailDigest } from '@/types/email'

// Define AccountProcessingLog interface
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

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')
		const error = searchParams.get('error')

		console.log(`🔗 OAuth callback received: code=${code}, error=${error}`)

		if (error) {
			console.error('OAuth error:', error)
			return NextResponse.redirect(new URL('/auth?error=oauth_error', request.url))
		}

		if (!code) {
			console.error('No authorization code received')
			return NextResponse.redirect(new URL('/auth?error=no_code', request.url))
		}

		// Exchange authorization code for tokens
		const tokens = await setGmailCredentials(code)
		console.log('🔑 Received tokens:', {
			access_token: tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'null',
			refresh_token: tokens.refresh_token ? 'present' : 'null',
			expiry_date: tokens.expiry_date,
			scope: tokens.scope
		})
		
		if (!tokens.access_token) {
			console.error('No access token received')
			return NextResponse.redirect(new URL('/auth?error=no_token', request.url))
		}

		// Get user info from Google
		console.log('📋 Getting user info with access token...')
		const userInfo = await getUserInfo(tokens.access_token)
		
		// Save credentials to JSON file
		await saveCredentials(tokens, userInfo)
		console.log(`✅ Credentials saved for ${userInfo.email}. Proceeding to initial summarization...`)

		try {
			// --- Start of summarization logic (adapted from /api/emails/summarize) ---
			const accessToken = tokens.access_token // From the current OAuth flow
			const accountEmail = userInfo.email
			const userId = userInfo.id

			const today = new Date().toISOString().split('T')[0]
			const currentTimestamp = new Date().toISOString()

			console.log(`🚀 Performing initial email summarization for new account: ${accountEmail} (${userId})`)

			// Step 1: Fetch today's emails
			const emails = await fetchTodaysEmailsWithContent(accessToken)
			console.log(`📧 Fetched ${emails.length} emails for initial summary.`)

			const contentStats = { // Log content stats
				totalEmails: emails.length,
				withTextContent: emails.filter(e => e.textContent).length,
				withHtmlContent: emails.filter(e => e.htmlContent).length,
				avgContentLength: emails.length > 0
					? Math.round(emails.reduce((sum, e) => sum + (e.bodyPreview?.length || 0), 0) / emails.length)
					: 0
			}
			console.log(`📊 Initial content stats:`, contentStats)

			if (emails.length === 0) {
				console.log('📭 No emails found from today for initial summary.')
				// Optionally log to account_processing_log.json even for initial setup
			} else {
				// Step 2: Prepare data for AI (save to unsummarized_debug.json)
				// This step is crucial as summarizeAndStoreEmails reads from this file.
				const existingDebugData = await readJsonFile<any>('unsummarized_debug.json').catch(() => [])
				const newDebugEntry = {
					userId,
					accountEmail,
					timestamp: currentTimestamp,
					messages: emails, // emails are already GmailMessageWithContent
					contentStats
				}
				// Ensure existingDebugData is an array
				const currentDebugDataArray = Array.isArray(existingDebugData) ? existingDebugData : []
				const filteredDebugData = currentDebugDataArray.filter((entry: any) =>
					!(entry.userId === userId && entry.accountEmail === accountEmail)
				)
				const updatedDebugData = [...filteredDebugData, newDebugEntry]
				await writeJsonFile('unsummarized_debug.json', updatedDebugData)
				console.log('💾 Saved fetched emails to unsummarized_debug.json for AI processing.')

				// Step 3: Run AI summarization
				const summarizationResult = await summarizeAndStoreEmails(userId, accountEmail)

				if (summarizationResult.success) {
					console.log(`✅ Initial summarization successful for ${accountEmail}. Digest ID: ${summarizationResult.digestId}`)
					// Log to account_processing_log.json
					const processingLogArray = await readJsonFile<AccountProcessingLog>('account_processing_log.json').catch(() => [])
					const currentProcessingLog = Array.isArray(processingLogArray) ? processingLogArray : []

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
					const updatedLog = currentProcessingLog.filter(log => log.id !== logEntry.id)
					updatedLog.push(logEntry)
					await writeJsonFile('account_processing_log.json', updatedLog)
				} else {
					console.error(`❌ Initial summarization failed for ${accountEmail}: ${summarizationResult.message}`)
					// Optionally log failure to account_processing_log.json
				}
			}
			// --- End of summarization logic ---
		} catch (summaryError) {
			console.error(`❌ Error during initial summarization for ${userInfo.email}:`, summaryError)
			// Don't let summarization error block the redirect, but log it.
		}

		// Redirect to dashboard with success (original logic)
		const redirectUrl = new URL('/dashboard/connected-emails', request.url)
		redirectUrl.searchParams.set('connected', 'success')
		redirectUrl.searchParams.set('email', userInfo.email)
		redirectUrl.searchParams.set('initial_summary_attempted', 'true') // Add a param to indicate summary was tried

		return NextResponse.redirect(redirectUrl.toString())
	} catch (error) {
		console.error('Error in OAuth callback:', error)
		return NextResponse.redirect(new URL('/auth?error=callback_error', request.url))
	}
}