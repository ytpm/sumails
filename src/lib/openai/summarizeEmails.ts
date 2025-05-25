import OpenAI from 'openai'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'
import type { EmailDigest, SummarizedMessage } from '@/types/email'
import type { UnsummarizedEmail, UnsummarizedDebugData } from '@/types/google'

// Zod schema for validating OpenAI response
const EmailSummaryGeneratedContentSchema = z.object({
	overview: z.array(z.string()),
	insight: z.string(),
	important_emails: z.array(z.object({
		subject: z.string(),
		sender: z.string(),
		reason: z.string()
	})),
	inbox_status: z.enum(['attention_needed', 'worth_a_look', 'all_clear']),
	suggestions: z.array(z.string()).optional()
})

// --- Initialize OpenAI Client ---
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Summarize and store emails using OpenAI
 */
export async function summarizeAndStoreEmails(userId?: string, accountEmail?: string, targetDate?: string): Promise<{
	success: boolean
	message: string
	digestId?: string
	processedEmails?: number
}> {
	try {
		console.log('🤖 Starting email summarization process...')

		// Step 1: Load emails from unsummarized_debug.json
		console.log('📂 Loading emails from unsummarized_debug.json...')
		const debugData: UnsummarizedDebugData[] = await readJsonFile('unsummarized_debug.json')
		
		if (!debugData || debugData.length === 0) {
			console.log('⚠️ No debug data found')
			return {
				success: false,
				message: 'No email data found in unsummarized_debug.json'
			}
		}

		// Get user ID and account email from latest debug entry if not provided
		const latestDebugEntry = debugData[debugData.length - 1]
		const actualUserId = userId || latestDebugEntry?.userId || 'user_unknown'
		const actualAccountEmail = accountEmail || latestDebugEntry?.accountEmail || 'unknown@example.com'
		
		console.log(`🚀 Starting summarizeAndStoreEmails for userId: ${actualUserId}, accountEmail: ${actualAccountEmail}${targetDate ? `, targetDate: ${targetDate}` : ''}`)

		// Step 1: Load unsummarized emails for this account from debug data
		console.log('📂 Loading unsummarized debug data...')
		
		// If targetDate is provided, look for specific date entry, otherwise use latest
		const accountData = targetDate 
			? debugData.find(entry => 
				entry.userId === actualUserId && 
				entry.accountEmail === actualAccountEmail && 
				(entry as any).targetDate === targetDate
			)
			: debugData.find(entry => 
				entry.userId === actualUserId && entry.accountEmail === actualAccountEmail
			)

		if (!accountData) {
			const dateInfo = targetDate ? ` for date ${targetDate}` : ''
			console.log(`❌ No debug data found for userId: ${actualUserId}, accountEmail: ${actualAccountEmail}${dateInfo}`)
			return {
				success: false,
				message: `No unsummarized emails found for ${actualAccountEmail}${dateInfo}. Please fetch emails first.`
			}
		}

		console.log(`✅ Found debug data for ${actualAccountEmail} with ${accountData.messages.length} emails`)
		const allEmails = accountData.messages || []

		if (allEmails.length === 0) {
			console.log('📭 No emails found to process')
			return {
				success: true,
				message: 'No emails found to process',
				processedEmails: 0
			}
		}

		console.log(`📧 Found ${allEmails.length} total emails for processing`)

		// Step 2: Load previously summarized message IDs
		console.log('📂 Loading previously summarized message IDs...')
		const summarizedMessages: SummarizedMessage[] = await readJsonFile('summarized_messages.json')
		const summarizedIds = new Set(summarizedMessages.map(msg => msg.id))
		
		console.log(`✅ Found ${summarizedIds.size} previously summarized messages`)

		// Step 3: Filter unsummarized emails
		const unsummarizedEmails = allEmails.filter(email => !summarizedIds.has(email.id))
		
		console.log(`🔍 Filtered to ${unsummarizedEmails.length} unsummarized emails`)

		if (unsummarizedEmails.length === 0) {
			console.log('✨ All emails have already been summarized')
			return {
				success: true,
				message: 'All emails have already been summarized',
				processedEmails: 0
			}
		}

		// Step 4: Format emails into enhanced markdown prompt
		console.log('📝 Formatting emails with enhanced content for OpenAI...')
		const emailsMarkdown = unsummarizedEmails
			.map(email => {
				const fromValue = email.from || 'Unknown Sender'
				const subjectValue = email.subject || 'No Subject'
				
				// Use enhanced content in priority order: textContent > bodyPreview > snippet
				let contentValue = 'No content available'
				if (email.textContent) {
					// Limit text content to 1000 characters for better AI processing
					contentValue = email.textContent.length > 1000 
						? email.textContent.substring(0, 1000) + '...' 
						: email.textContent
				} else if (email.bodyPreview) {
					contentValue = email.bodyPreview
				} else if (email.snippet) {
					contentValue = email.snippet
				}
				
				return `From: ${fromValue}
Subject: ${subjectValue}
Content: ${contentValue}`
			})
			.join('\n\n---\n\n')

		// Step 5: Create enhanced prompt for OpenAI
		// Adjust prompt based on whether this is for a specific date or general
		const timeContext = targetDate ? `for ${targetDate}` : 'from the last 7 days for initial account setup'
		const systemPrompt = `You are an AI email assistant helping the user manage their Gmail inbox. You have access to emails ${timeContext}. Your job is to make sense of the inbox, surface what's important, and reduce the user's cognitive load.

Perform the following:

1. **Overview (bullet points)**
   Create 3 to 5 short bullet points that give a quick overview of the inbox activity. Include:
   - Number of emails received (e.g., "Received 12 emails today" or "Received 45 emails this week")
   - Number of important or actionable messages (e.g., "3 important messages flagged")
   - Topics or categories observed (e.g., "Topics: work projects, billing, newsletters")
   ${targetDate ? '' : '- Weekly patterns if notable (e.g., "Heavy email volume on weekdays")'}

2. **Insight**
   Write one short sentence summarizing your assessment of the inbox. Be specific and helpful. (e.g., "Several urgent work items need attention, but overall inbox health is good.")

3. **Important Emails**
   Highlight up to 5 emails that deserve attention. Prioritize:
   - Urgent action items
   - Security alerts, billing issues
   - Replies needing follow-up
   - Anything time-sensitive or critical

   For each, return:
   - \`subject\`
   - \`sender\`
   - \`reason\` (why it's important)

4. **Inbox Health Status**
   Classify the inbox into one of the following:
   - \`"attention_needed"\`: contains urgent or important emails
   - \`"worth_a_look"\`: moderate relevance, some things to review
   - \`"all_clear"\`: nothing critical ${targetDate ? 'today' : 'this week'}

5. **Suggestions for Cleanup**
   Suggest up to 3 actions the user can take to reduce clutter or improve inbox hygiene. Focus on patterns in senders, email types, or repeated content. (e.g., "Unsubscribe from daily promotional emails")

Return your output in the following JSON format:

\`\`\`
{
  "overview": ["string", "string", "string"],
  "insight": "string", 
  "important_emails": [
    {
      "subject": "string",
      "sender": "string",
      "reason": "string"
    }
  ],
  "inbox_status": "attention_needed" | "worth_a_look" | "all_clear",
  "suggestions": ["string", "string", "string"]
}
\`\`\`
`

		const userPrompt = `Here are the emails with full content to analyze:\n\n${emailsMarkdown}`

		// Step 6: Call OpenAI with structured output
		console.log('🤖 Calling OpenAI for email summarization...')
		
		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			response_format: { type: 'json_object' },
			temperature: 0.7,
		})

		console.log('🤖 OpenAI response received')

		const content = response.choices[0]?.message?.content
		if (!content) {
			console.error('❌ OpenAI did not return any content')
			throw new Error('OpenAI did not return any content for summarization')
		}

		console.log('📊 Parsing OpenAI response...')
		const parsedContent = JSON.parse(content)
		const validatedContent = EmailSummaryGeneratedContentSchema.parse(parsedContent)

		// Step 7: Create digest object
		const digestId = nanoid()
		const currentTimestamp = new Date().toISOString()

		const newDigest: EmailDigest = {
			id: digestId,
			userId: actualUserId,
			accountId: actualAccountEmail,
			date: targetDate || currentTimestamp.split('T')[0], // Use targetDate if provided, otherwise today
			created_at: currentTimestamp,

			// Map new fields from validatedContent
			overview: validatedContent.overview,
			insight: validatedContent.insight,
			important_emails: validatedContent.important_emails,
			inbox_status: validatedContent.inbox_status,
			suggestions: validatedContent.suggestions,
		}

		// Step 8: Load and update email_digests.json
		console.log('💾 Updating email_digests.json...')
		const existingDigests: EmailDigest[] = await readJsonFile('email_digests.json')
		console.log(`📂 Loaded ${existingDigests.length} existing digests`)
		const updatedDigests = [...existingDigests, newDigest]
		console.log(`📝 About to save ${updatedDigests.length} digests to email_digests.json`)
		
		try {
			await writeJsonFile('email_digests.json', updatedDigests)
			console.log('✅ Successfully saved digest to email_digests.json')
		} catch (error) {
			console.error('❌ Failed to save digest to email_digests.json:', error)
			throw error
		}

		// Step 9: Update summarized_messages.json
		console.log('💾 Updating summarized_messages.json...')
		const newSummarizedMessages: SummarizedMessage[] = unsummarizedEmails.map(email => ({
			id: email.id,
			accountId: actualAccountEmail,
			summarized_at: currentTimestamp
		}))
		
		console.log(`📝 Creating ${newSummarizedMessages.length} new summarized message records`)
		const updatedSummarizedMessages = [...summarizedMessages, ...newSummarizedMessages]
		console.log(`📝 About to save ${updatedSummarizedMessages.length} summarized messages`)
		
		try {
			await writeJsonFile('summarized_messages.json', updatedSummarizedMessages)
			console.log('✅ Successfully saved summarized messages to summarized_messages.json')
		} catch (error) {
			console.error('❌ Failed to save summarized messages:', error)
			throw error
		}

		console.log('✅ Email summarization completed successfully!')
		console.log(`📊 Digest created with ID: ${digestId}`)
		console.log(`📧 Processed ${unsummarizedEmails.length} emails`)
		console.log(`📊 Inbox Status: ${validatedContent.inbox_status}`)
		console.log(`⭐ Important Emails: ${validatedContent.important_emails.length}`)
		console.log(`💡 Suggestions: ${validatedContent.suggestions?.join(', ') || 'None'}`)

		return {
			success: true,
			message: `Successfully processed ${unsummarizedEmails.length} emails and created digest`,
			digestId: digestId,
			processedEmails: unsummarizedEmails.length
		}

	} catch (error) {
		console.error('❌ Error in summarizeAndStoreEmails:', error)
		
		if (error instanceof z.ZodError) {
			console.error('📋 Schema validation error:', error.errors)
			return {
				success: false,
				message: `Schema validation failed: ${error.errors.map(e => e.message).join(', ')}`
			}
		}
		
		if (error instanceof Error) {
			return {
				success: false,
				message: `Error: ${error.message}`
			}
		}
		
		return {
			success: false,
			message: 'An unknown error occurred during email summarization'
		}
	}
} 