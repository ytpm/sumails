import { writeJsonFile, readJsonFile } from '@/lib/json_handler'
import { summarizeAndStoreEmails } from '@/lib/openai/summarizeEmails'
import type { EmailDataWithContent } from '@/types/google'

/**
 * Group emails by their actual received date
 */
export function groupEmailsByDate(emails: EmailDataWithContent[]): Record<string, EmailDataWithContent[]> {
	return emails.reduce((groups, email) => {
		// Extract date from email.date (ISO string) and convert to YYYY-MM-DD
		const emailDate = new Date(email.date).toISOString().split('T')[0]
		
		if (!groups[emailDate]) {
			groups[emailDate] = []
		}
		groups[emailDate].push(email)
		return groups
	}, {} as Record<string, EmailDataWithContent[]>)
}

/**
 * Create a daily digest for a specific date
 */
export async function createDailyDigest(
	userId: string,
	accountEmail: string,
	date: string,
	emails: EmailDataWithContent[]
): Promise<{
	success: boolean
	message: string
	digestId?: string
	processedEmails?: number
}> {
	try {
		console.log(`📅 Creating daily digest for ${date} with ${emails.length} emails`)

		// Save emails to debug data for this specific date
		const debugEntry = {
			userId,
			accountEmail,
			timestamp: new Date().toISOString(),
			messages: emails,
			targetDate: date, // Important: specify which date this is for
			contentStats: {
				totalEmails: emails.length,
				withTextContent: emails.filter(e => e.textContent).length,
				withHtmlContent: emails.filter(e => e.htmlContent).length,
				avgContentLength: emails.length > 0
					? Math.round(emails.reduce((sum, e) => sum + (e.bodyPreview?.length || 0), 0) / emails.length)
					: 0
			}
		}

		// Update debug data
		const existingDebugData = await readJsonFile('unsummarized_debug.json').catch(() => [])
		const currentDebugDataArray = Array.isArray(existingDebugData) ? existingDebugData : []
		
		// Remove existing entry for this account and date combination
		const filteredDebugData = currentDebugDataArray.filter((entry: any) =>
			!(entry.userId === userId && entry.accountEmail === accountEmail && entry.targetDate === date)
		)
		
		const updatedDebugData = [...filteredDebugData, debugEntry]
		await writeJsonFile('unsummarized_debug.json', updatedDebugData)
		
		console.log(`💾 Saved ${emails.length} emails to debug data for ${date}`)

		// Create AI summary for this specific date using existing function
		// Pass the targetDate to ensure the digest is created for the correct date
		const summarizationResult = await summarizeAndStoreEmails(userId, accountEmail, date)

		if (summarizationResult.success) {
			console.log(`✅ Daily digest created successfully for ${date}. Digest ID: ${summarizationResult.digestId}`)
		} else {
			console.error(`❌ Failed to create daily digest for ${date}: ${summarizationResult.message}`)
		}

		return summarizationResult

	} catch (error) {
		console.error(`❌ Error creating daily digest for ${date}:`, error)
		return {
			success: false,
			message: `Failed to create daily digest for ${date}: ${error}`
		}
	}
} 