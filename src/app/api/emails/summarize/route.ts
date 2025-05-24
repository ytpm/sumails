import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'
import type { GmailMessage, SummarizedMessage, CleanedMessage } from '@/types/email'

export async function POST(request: NextRequest) {
	try {
		const { messages, userId, accountEmail } = await request.json()

		if (!messages || !userId || !accountEmail) {
			return NextResponse.json(
				{ error: 'Messages, userId, and accountEmail are required' },
				{ status: 400 }
			)
		}

		console.log(`📧 Processing ${messages.length} messages for ${accountEmail} (userId: ${userId})`)

		// Step 1: Read existing summarized messages
		const summarizedMessages = await readJsonFile<SummarizedMessage>('summarized_messages.json')
		console.log(`📊 Found ${summarizedMessages.length} already summarized messages`)

		// Step 2: Filter out already summarized messages
		const alreadySummarizedIds = summarizedMessages
			.filter((msg) => msg.userId === userId && msg.accountEmail === accountEmail)
			.map((msg) => msg.messageId)

		console.log(`🔍 ${alreadySummarizedIds.length} messages already summarized for this account`)

		const unsummarizedMessages: GmailMessage[] = messages.filter(
			(msg: GmailMessage) => !alreadySummarizedIds.includes(msg.id)
		)

		console.log(`✅ ${unsummarizedMessages.length} new messages to process`)

		// Step 3: Save filtered messages for debug/testing (optional)
		if (unsummarizedMessages.length > 0) {
			try {
				// Read existing debug data
				const existingDebugData = await readJsonFile('unsummarized_debug.json').catch(() => [])
				
				// Create new debug entry
				const newDebugData = {
					userId,
					accountEmail,
					timestamp: new Date().toISOString(),
					messages: unsummarizedMessages
				}
				
				// Remove any existing entry for the same userId + accountEmail combination
				const filteredDebugData = existingDebugData.filter((entry: any) => 
					!(entry.userId === userId && entry.accountEmail === accountEmail)
				)
				
				// Add the new entry
				const updatedDebugData = [...filteredDebugData, newDebugData]
				
				// Write the combined data back
				await writeJsonFile('unsummarized_debug.json', updatedDebugData)
				console.log(`💾 Updated debug entry for ${accountEmail} with ${unsummarizedMessages.length} messages (total entries: ${updatedDebugData.length})`)
			} catch (debugError) {
				console.warn('⚠️ Failed to save debug data:', debugError)
				// Don't fail the main operation if debug saving fails
			}
		}

		// Step 4: Prepare cleaned messages for future OpenAI use
		const cleanedMessages: CleanedMessage[] = unsummarizedMessages.map((msg) => ({
			id: msg.id,
			subject: msg.subject,
			from: msg.from,
			date: msg.date,
			snippet: msg.snippet
		}))

		// Return the filtered and cleaned messages
		return NextResponse.json({
			success: true,
			totalMessages: messages.length,
			alreadySummarized: alreadySummarizedIds.length,
			newMessages: unsummarizedMessages.length,
			cleanedMessages,
			message: unsummarizedMessages.length > 0 
				? `Found ${unsummarizedMessages.length} new messages ready for summarization`
				: 'All messages have already been summarized'
		})

	} catch (error) {
		console.error('❌ Error processing messages for summarization:', error)
		return NextResponse.json(
			{ error: 'Failed to process messages for summarization' },
			{ status: 500 }
		)
	}
} 