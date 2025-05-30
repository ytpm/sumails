import OpenAI from 'openai'
import type { 
	GmailMessageWithContent, 
	SummaryData, 
	InboxStatus,
	EmailSummaryInsert 
} from '@/types/email'
import { SummaryResponseSchema } from '@/schema/summary-schemas'
import { createEmailSummary, summaryExistsForDate } from './summaries'

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate and store an email summary using OpenAI
 * 
 * @param userId - The user ID
 * @param accountId - The connected account ID
 * @param emails - Array of emails to summarize
 * @param dateProcessed - The date being processed (YYYY-MM-DD format)
 * @param forceRegenerate - Whether to regenerate if summary already exists
 * @returns Summary generation result
 */
export async function generateEmailSummary(
	userId: string,
	accountId: string,
	emails: GmailMessageWithContent[],
	dateProcessed: string,
	forceRegenerate: boolean = false
): Promise<{
	success: boolean
	message: string
	summaryId?: string
	inboxStatus?: InboxStatus
	emailCount: number
}> {
	try {
		console.log(`🤖 Starting email summary generation for ${emails.length} emails`)
		console.log(`📅 Processing date: ${dateProcessed}`)
		console.log(`👤 User: ${userId}, Account: ${accountId}`)

		// Check if summary already exists for this date
		if (!forceRegenerate) {
			const existingSummary = await summaryExistsForDate(userId, accountId, dateProcessed)
			if (existingSummary) {
				console.log(`✅ Summary already exists for ${dateProcessed}`)
				return {
					success: true,
					message: `Summary already exists for ${dateProcessed}. Use forceRegenerate=true to override.`,
					emailCount: emails.length
				}
			}
		}

		// Handle empty email case
		if (emails.length === 0) {
			console.log('📭 No emails to process - creating "all_clear" summary')
			
			const summaryData: SummaryData = {
				overview: ['No emails received today'],
				insight: 'Your inbox is completely clear today.',
				important_emails: [],
				suggestions: ['Great job staying on top of your emails!']
			}

			const summaryInsert: EmailSummaryInsert = {
				user_id: userId,
				connected_account_id: accountId,
				email_count: 0,
				inbox_status: 'all_clear',
				date_processed: dateProcessed,
				summary_data: summaryData as any // Cast to Json until types are updated
			}

			const createdSummary = await createEmailSummary(summaryInsert)
			
			return {
				success: true,
				message: 'Created summary for empty inbox',
				summaryId: createdSummary.id,
				inboxStatus: 'all_clear',
				emailCount: 0
			}
		}

		// Format emails for OpenAI processing
		console.log('📝 Formatting emails for AI analysis...')
		const emailsMarkdown = formatEmailsForAI(emails)

		// Create AI prompt
		const systemPrompt = createSystemPrompt(dateProcessed)
		const userPrompt = `Here are the emails with full content to analyze:\n\n${emailsMarkdown}`

		// Call OpenAI API
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

		const content = response.choices[0]?.message?.content
		if (!content) {
			throw new Error('OpenAI did not return any content for summarization')
		}

		// Parse and validate OpenAI response
		console.log('📊 Parsing and validating OpenAI response...')
		const parsedContent = JSON.parse(content)
		const validatedContent = SummaryResponseSchema.parse(parsedContent)

		// Create summary record in database
		const summaryInsert: EmailSummaryInsert = {
			user_id: userId,
			connected_account_id: accountId,
			email_count: emails.length,
			inbox_status: validatedContent.inbox_status,
			date_processed: dateProcessed,
			summary_data: {
				overview: validatedContent.overview,
				insight: validatedContent.insight,
				important_emails: validatedContent.important_emails,
				suggestions: validatedContent.suggestions
			} as any // Cast to Json until types are updated
		}

		const createdSummary = await createEmailSummary(summaryInsert)

		console.log('✅ Email summary generated successfully!')
		console.log(`📊 Summary ID: ${createdSummary.id}`)
		console.log(`📧 Processed ${emails.length} emails`)
		console.log(`📊 Inbox Status: ${validatedContent.inbox_status}`)
		console.log(`⭐ Important Emails: ${validatedContent.important_emails.length}`)

		return {
			success: true,
			message: `Successfully processed ${emails.length} emails and created summary`,
			summaryId: createdSummary.id,
			inboxStatus: validatedContent.inbox_status,
			emailCount: emails.length
		}

	} catch (error) {
		console.error('❌ Error in generateEmailSummary:', error)
		
		if (error instanceof Error && error.name === 'ZodError') {
			console.error('📋 Schema validation error:', error.message)
			return {
				success: false,
				message: `Schema validation failed: ${error.message}`,
				emailCount: emails.length
			}
		}
		
		if (error instanceof Error) {
			return {
				success: false,
				message: `Error: ${error.message}`,
				emailCount: emails.length
			}
		}
		
		return {
			success: false,
			message: 'An unknown error occurred during email summarization',
			emailCount: emails.length
		}
	}
}

/**
 * Format emails into markdown for AI processing
 * 
 * @param emails - Array of emails to format
 * @returns Formatted markdown string
 */
function formatEmailsForAI(emails: GmailMessageWithContent[]): string {
	return emails
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
}

/**
 * Create the system prompt for OpenAI
 * 
 * @param dateProcessed - The date being processed
 * @param userContext - The user's personal context (optional)
 * @returns System prompt string
 * 
 */
function createSystemPrompt(dateProcessed: string, userContext?: string): string {
	const isToday = dateProcessed === new Date().toISOString().split('T')[0]
	const timeContext = isToday ? 'today' : `on ${dateProcessed}`
	
	return `You are an AI email assistant helping the user manage their Gmail inbox. You have access to emails ${timeContext}. Your job is to make sense of the inbox, surface what's important, and reduce the user's cognitive load.

${userContext ? `User Context: ${userContext}` : ''}

Perform the following:

1. **Overview (bullet points)**
   Create 3 to 5 short bullet points that give a quick overview of the inbox activity. Include:
   - Number of emails received (e.g., "Received 12 emails ${timeContext}")
   - Number of important or actionable messages (e.g., "3 important messages flagged")
   - Topics or categories observed (e.g., "Topics: work projects, billing, newsletters")

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
   - \`"all_clear"\`: nothing critical ${timeContext}

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
\`\`\``
} 