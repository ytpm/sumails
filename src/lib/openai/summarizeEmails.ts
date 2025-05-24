import OpenAI from 'openai'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'

// --- Zod Schema Definitions ---
export const EmailSummaryGeneratedContentSchema = z.object({
	status: z.enum(['attention_needed', 'worth_a_look', 'all_clear']).describe('The general state of the inbox'),
	overview: z.array(z.string()).describe('3 short bullet points about inbox activity'),
	insight: z.string().describe('One-sentence AI assessment of the inbox'),
	highlights: z.array(
		z.object({
			subject: z.string().describe('The subject of the important email'),
			from: z.string().describe('The sender of the important email'),
		})
	).describe('Up to 5 important emails with subject and sender'),
	suggestion: z.string().optional().describe('Optional inbox cleanup suggestion'),
})

// --- Type Definitions ---
interface UnsummarizedEmail {
	id: string
	subject: string
	snippet: string
	from: string
	internalDate?: string
	date?: string
	// Enhanced content fields
	textContent?: string
	htmlContent?: string
	bodyPreview?: string
}

interface SummarizedMessage {
	id: string
	accountId: string
	summarized_at: string
}

interface EmailDigest {
	id: string
	userId: string
	accountId: string
	date: string
	status: 'attention_needed' | 'worth_a_look' | 'all_clear'
	overview: string[]
	insight: string
	highlights: Array<{
		subject: string
		from: string
	}>
	suggestion?: string
	created_at: string
}

interface UnsummarizedDebugData {
	userId: string
	accountEmail: string
	timestamp: string
	messages: UnsummarizedEmail[]
	contentStats?: {
		totalEmails: number
		withTextContent: number
		withHtmlContent: number
		avgContentLength: number
	}
}

// --- Initialize OpenAI Client ---
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Summarize and store emails using OpenAI
 */
export async function summarizeAndStoreEmails(userId?: string, accountEmail?: string): Promise<{
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
		
		console.log(`🔍 Processing for userId: ${actualUserId}, accountEmail: ${actualAccountEmail}`)

		// Flatten all messages from all accounts
		const allEmails: UnsummarizedEmail[] = []
		for (const accountData of debugData) {
			allEmails.push(...accountData.messages)
		}

		console.log(`📧 Found ${allEmails.length} total emails across ${debugData.length} accounts`)

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
		const systemPrompt = `You are an AI email assistant summarizing today's email activity. Given the full content of recent emails, perform the following:

1. Determine the general state of the inbox. Choose one of the following values:
   - "attention_needed": critical or urgent content like security alerts, payment failures, or requests
   - "worth_a_look": some messages may need a glance or follow-up, but nothing urgent
   - "all_clear": no urgent content, mostly newsletters, promos, or routine updates

2. Generate a concise inbox overview as a list of 3 short bullet points:
   - 📬 Number of emails received today (e.g., "28 emails today")
   - 🔥 Number of flagged or actionable emails (e.g., "2 urgent messages")
   - 💬 Topics or categories observed (e.g., "Topics: billing, platform updates, newsletters")

3. Provide a one-sentence AI insight:
   - Summarize your assessment of the inbox (e.g., "Security alerts were present, but no immediate action needed.")

4. List up to 5 highlights (subject and sender):
   - Focus only on clearly important or actionable emails

5. Optionally, return one inbox cleanup suggestion if relevant:
   - Suggest unsubscribing from up to 3 promotional senders
   - Format the string like: "Consider unsubscribing from X, Y and Z (if many. State the name of the sender) to reduce clutter."

Return a JSON object with this structure:
{
  "status": "attention_needed" | "worth_a_look" | "all_clear",
  "overview": [
    "📬 28 emails today",
    "🔥 2 important messages",
    "💬 Topics: security alerts, payments, newsletters"
  ],
  "insight": "Security alerts need review, but nothing time-sensitive.",
  "highlights": [
    { "subject": "Reset your password", "from": "Google" },
    { "subject": "Payment failed for invoice #3389", "from": "Stripe" }
  ],
  "suggestion": "Consider unsubscribing from bolt.new, Gett Taxi, and Vibe to reduce clutter."
}`

		const userPrompt = `Here are today's emails with full content to analyze:\n\n${emailsMarkdown}`

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
			date: currentTimestamp.split('T')[0], // ISO date string (YYYY-MM-DD)
			status: validatedContent.status,
			overview: validatedContent.overview,
			insight: validatedContent.insight,
			highlights: validatedContent.highlights,
			suggestion: validatedContent.suggestion,
			created_at: currentTimestamp
		}

		// Step 8: Load and update email_digests.json
		console.log('💾 Updating email_digests.json...')
		const existingDigests: EmailDigest[] = await readJsonFile('email_digests.json')
		const updatedDigests = [...existingDigests, newDigest]
		await writeJsonFile('email_digests.json', updatedDigests)

		// Step 9: Update summarized_messages.json
		console.log('💾 Updating summarized_messages.json...')
		const newSummarizedMessages: SummarizedMessage[] = unsummarizedEmails.map(email => ({
			id: email.id,
			accountId: actualAccountEmail,
			summarized_at: currentTimestamp
		}))
		
		const updatedSummarizedMessages = [...summarizedMessages, ...newSummarizedMessages]
		await writeJsonFile('summarized_messages.json', updatedSummarizedMessages)

		console.log('✅ Email summarization completed successfully!')
		console.log(`📊 Digest created with ID: ${digestId}`)
		console.log(`📧 Processed ${unsummarizedEmails.length} emails`)
		console.log(`📊 Status: ${validatedContent.status}`)
		console.log(`📋 Overview: ${validatedContent.overview.join(', ')}`)
		console.log(`💡 Insight: ${validatedContent.insight}`)
		console.log(`⭐ Highlights: ${validatedContent.highlights.length} important emails`)
		console.log(`💡 Suggestion: ${validatedContent.suggestion || 'None'}`)

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