import { NextRequest, NextResponse } from 'next/server'
import { setGmailCredentials } from '@/lib/google/actions'
import { saveCredentials, getUserInfo } from '@/lib/google/credentials'
import { fetchTodaysEmailsWithContent, fetchEmailsFromPeriod } from '@/lib/google/actions'
import { summarizeAndStoreEmails } from '@/lib/openai/summarizeEmails'
import { writeJsonFile, readJsonFile } from '@/lib/json_handler'
import { groupEmailsByDate, createDailyDigest } from '@/lib/email-utils'
import type { GmailMessageWithContent, SummarizedMessage, EmailDigest } from '@/types/email'
import type { AccountProcessingLog } from '@/types/api'

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
			// --- Start of enhanced daily digest creation logic ---
			const accessToken = tokens.access_token
			const accountEmail = userInfo.email
			const userId = userInfo.id
			const currentTimestamp = new Date().toISOString()

			console.log(`🚀 Performing initial email summarization for new account: ${accountEmail} (${userId})`)

			// Step 1: Fetch emails from last 7 days
			const emails = await fetchEmailsFromPeriod(accessToken, 7)
			console.log(`📧 Fetched ${emails.length} emails from last 7 days for initial summary.`)

			const contentStats = {
				totalEmails: emails.length,
				withTextContent: emails.filter(e => e.textContent).length,
				withHtmlContent: emails.filter(e => e.htmlContent).length,
				avgContentLength: emails.length > 0
					? Math.round(emails.reduce((sum, e) => sum + (e.bodyPreview?.length || 0), 0) / emails.length)
					: 0
			}
			console.log(`📊 Initial content stats:`, contentStats)

			if (emails.length === 0) {
				console.log('📭 No emails found from last 7 days for initial summary.')
			} else {
				// Step 2: Group emails by their actual received date
				console.log('📅 Grouping emails by date...')
				const emailsByDate = groupEmailsByDate(emails)
				const dates = Object.keys(emailsByDate).sort() // Sort dates chronologically
				
				console.log(`📊 Found emails across ${dates.length} days:`)
				dates.forEach(date => {
					console.log(`  📅 ${date}: ${emailsByDate[date].length} emails`)
				})

				// Step 3: Create daily digests for each date
				const digestResults = []
				let totalEmailsProcessed = 0
				let totalDigestsCreated = 0

				for (const date of dates) {
					const dayEmails = emailsByDate[date]
					console.log(`\n🔄 Processing ${dayEmails.length} emails for ${date}...`)
					
					try {
						const result = await createDailyDigest(userId, accountEmail, date, dayEmails)
						digestResults.push({
							date,
							success: result.success,
							digestId: result.digestId,
							emailsProcessed: result.processedEmails || 0,
							message: result.message
						})

						if (result.success) {
							totalEmailsProcessed += result.processedEmails || 0
							totalDigestsCreated++
							console.log(`✅ Created digest for ${date}: ${result.digestId}`)
						} else {
							console.error(`❌ Failed to create digest for ${date}: ${result.message}`)
						}
					} catch (error) {
						console.error(`❌ Error processing ${date}:`, error)
						digestResults.push({
							date,
							success: false,
							emailsProcessed: 0,
							message: `Error: ${error}`
						})
					}
				}

				// Step 4: Log processing results to account_processing_log.json
				console.log(`\n📊 Summary: Created ${totalDigestsCreated}/${dates.length} daily digests`)
				console.log(`📧 Total emails processed: ${totalEmailsProcessed}/${emails.length}`)

				// Create a summary log entry for the initial setup
				const processingLogArray = await readJsonFile<AccountProcessingLog>('account_processing_log.json').catch(() => [])
				const currentProcessingLog = Array.isArray(processingLogArray) ? processingLogArray : []

				// Create log entries for each successful date
				for (const result of digestResults) {
					if (result.success) {
						const logEntry: AccountProcessingLog = {
							id: `${userId}_${accountEmail}_${result.date}`.replace(/[^a-zA-Z0-9_]/g, '_'),
							account_email: accountEmail,
							userId: userId,
							date: result.date,
							last_processed_at: currentTimestamp,
							emails_fetched: emailsByDate[result.date].length,
							emails_summarized: result.emailsProcessed,
							digest_id: result.digestId,
							status: 'success'
						}
						
						// Remove any existing entry for this date and add new one
						const filteredLog = currentProcessingLog.filter(log => log.id !== logEntry.id)
						filteredLog.push(logEntry)
						currentProcessingLog.length = 0
						currentProcessingLog.push(...filteredLog)
					}
				}

				await writeJsonFile('account_processing_log.json', currentProcessingLog)
				console.log(`✅ Updated processing log with ${totalDigestsCreated} entries`)
			}
			// --- End of enhanced daily digest creation logic ---
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