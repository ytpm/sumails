import OpenAI from 'openai'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'

// --- Zod Schema Definitions ---
export const EmailSummaryGeneratedContentSchema = z.object({
	summary: z.string().describe('A short summary of the inbox activity (2-4 sentences)'),
	highlights: z.array(
		z.object({
			subject: z.string().describe('The subject of the important email'),
			from: z.string().describe('The sender of the important email'),
		})
	).describe('Up to 5 important emails with subject and sender'),
	suggestion: z.string().describe('A single inbox health tip or improvement idea'),
})

// --- Type Definitions ---
interface UnsummarizedEmail {
	id: string
	subject: string
	snippet: string
	from: string
	internalDate?: string
	date?: string
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
	summary: string
	highlights: Array<{
		subject: string
		from: string
	}>
	suggestion: string
	created_at: string
}

interface UnsummarizedDebugData {
	userId: string
	accountEmail: string
	timestamp: string
	messages: UnsummarizedEmail[]
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

		// Step 4: Format emails into markdown prompt
		console.log('📝 Formatting emails for OpenAI...')
		const emailsMarkdown = unsummarizedEmails
			.map(email => {
				const fromValue = email.from || 'Unknown Sender'
				const subjectValue = email.subject || 'No Subject'
				const snippetValue = email.snippet || 'No preview available'
				
				return `From: ${fromValue}
Subject: ${subjectValue}
Snippet: ${snippetValue}`
			})
			.join('\n\n---\n\n')

		// Step 5: Create the prompt for OpenAI
		const systemPrompt = `You are an AI email assistant. Given the following list of recent emails, do the following:

1. Generate a short summary of the inbox activity (2–4 sentences)
2. Identify and highlight up to 5 important emails (include subject and sender)
3. Suggest how the user might improve inbox management (e.g., too many promos, unread count, etc.)

Format your output in JSON:
{
  "summary": "Your short summary...",
  "highlights": [
    {"subject": "Subject A", "from": "Sender A"},
    ...
  ],
  "suggestion": "Your single inbox health tip or improvement idea"
}`

		const userPrompt = `Here are the recent emails to analyze:\n\n${emailsMarkdown}`

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
			summary: validatedContent.summary,
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
		console.log(`📝 Summary: ${validatedContent.summary}`)
		console.log(`⭐ Highlights: ${validatedContent.highlights.length} important emails`)
		console.log(`💡 Suggestion: ${validatedContent.suggestion}`)

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