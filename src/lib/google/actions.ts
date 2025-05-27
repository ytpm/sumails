import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import type { gmail_v1 } from 'googleapis'
import type { EmailData, EmailDataWithContent } from '@/types/google'

class GmailService {
	private auth: GoogleAuth
	private gmail: gmail_v1.Gmail | null = null

	constructor() {
		this.auth = new GoogleAuth({
			scopes: [
				'https://www.googleapis.com/auth/gmail.readonly',
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile'
			],
			credentials: {
				client_id: process.env.GOOGLE_CLIENT_ID,
				client_secret: process.env.GOOGLE_CLIENT_SECRET,
			},
		})
	}

	/**
	 * Initialize Gmail API client
	 */
	private async initializeGmail() {
		if (!this.gmail) {
			const authClient = await this.auth.getClient()
			this.gmail = google.gmail({ version: 'v1', auth: authClient as any })
		}
		return this.gmail
	}

	/**
	 * Get OAuth2 URL for user authentication
	 */
	getAuthUrl(): string {
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.NODE_ENV === 'production' 
				? 'https://your-domain.com/api/auth/callback' 
				: 'http://localhost:3000/api/auth/callback'
		)

		const scopes = [
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile'
		]

		return oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: scopes,
			prompt: 'consent',
		})
	}

	/**
	 * 🚀 Efficient Strategy: Fetch today's emails with full content
	 * Uses parallel Promise.all() approach for better performance
	 * Fetches ALL emails from today for comprehensive analysis with pagination
	 */
	async fetchTodaysEmailsWithContent(
		accessToken: string, 
		maxResults?: number // Optional limit for testing, defaults to ALL emails
	): Promise<EmailDataWithContent[]> {
		try {
			console.log('🔍 Fetching ALL today\'s emails with full content...')
			
			// Create OAuth2 client with access token
			const oauth2Client = new google.auth.OAuth2(
				process.env.GOOGLE_CLIENT_ID,
				process.env.GOOGLE_CLIENT_SECRET
			)
			
			oauth2Client.setCredentials({ access_token: accessToken })
			const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

			// Step 1: Fetch ALL messages with pagination
			const allMessages: any[] = []
			let pageToken: string | undefined
			let requestCount = 0
			const maxRequestsPerPage = 100 // Gmail's maximum per request

			do {
				requestCount++
				console.log(`📄 Fetching page ${requestCount} of today's emails...`)
				
				const messageList = await gmail.users.messages.list({
					userId: 'me',
					maxResults: maxRequestsPerPage,
					q: 'newer_than:1d', // Only today's emails
					pageToken,
				})

				const messages = messageList.data.messages || []
				allMessages.push(...messages)
				pageToken = messageList.data.nextPageToken || undefined

				console.log(`📧 Page ${requestCount}: Found ${messages.length} messages (Total so far: ${allMessages.length})`)

				// Safety check - if user specified maxResults, respect it
				if (maxResults && allMessages.length >= maxResults) {
					console.log(`⚠️ Reached specified limit of ${maxResults} emails`)
					break
				}

				// Safety check - prevent infinite loops (max 10 pages = 1000 emails)
				if (requestCount >= 10) {
					console.log(`⚠️ Reached maximum page limit (10 pages). Total emails: ${allMessages.length}`)
					break
				}

			} while (pageToken)

			console.log(`📧 Total messages found from today: ${allMessages.length}`)

			if (allMessages.length === 0) {
				return []
			}

			// Limit to maxResults if specified
			const messagesToProcess = maxResults 
				? allMessages.slice(0, maxResults)
				: allMessages

			console.log(`📧 Processing ${messagesToProcess.length} messages`)

			// Step 2: Parallel fetch all message details with rate limiting
			console.log('⚡ Fetching full content in parallel...')
			
			// Add small delay between requests to avoid rate limiting
			const fetchWithDelay = async (messageId: string, index: number) => {
				// Small staggered delay to avoid hitting rate limits
				if (index > 0) {
					await new Promise(resolve => setTimeout(resolve, 30 * (index % 10))) // Stagger every 10 requests
				}
				
				return gmail.users.messages.get({
					userId: 'me',
					id: messageId,
					format: 'full', // Get full message content
				})
			}

			// Step 3: Execute all requests in parallel (in batches)
			const batchSize = 20 // Process in smaller batches to avoid rate limits
			const emailsWithContent: EmailDataWithContent[] = []

			for (let i = 0; i < messagesToProcess.length; i += batchSize) {
				const batch = messagesToProcess.slice(i, i + batchSize)
				console.log(`⚡ Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messagesToProcess.length / batchSize)} (${batch.length} emails)`)

				const batchPromises = batch.map((msg, index) => 
					msg.id ? fetchWithDelay(msg.id, index) : null
				).filter(Boolean)

				const batchResults = await Promise.all(batchPromises)
				
				// Parse batch results
				for (const messageResponse of batchResults) {
					if (messageResponse?.data) {
						const emailData = this.parseEmailDataWithContent(messageResponse.data)
						if (emailData) {
							emailsWithContent.push(emailData)
						}
					}
				}

				console.log(`✅ Batch completed. Total processed so far: ${emailsWithContent.length}`)
			}

			console.log(`🎯 Successfully parsed ${emailsWithContent.length} emails with content`)
			return emailsWithContent

		} catch (error) {
			console.error('❌ Error fetching today\'s emails with content:', error)
			throw new Error(`Failed to fetch today's emails with content: ${error}`)
		}
	}

	/**
	 * Parse Gmail message data into our EmailDataWithContent format
	 */
	private parseEmailDataWithContent(message: gmail_v1.Schema$Message): EmailDataWithContent | null {
		try {
			if (!message.id || !message.threadId) {
				return null
			}

			const headers = message.payload?.headers || []
			
			const getHeader = (name: string): string => {
				const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase())
				return header?.value || ''
			}

			const { textContent, htmlContent, bodyPreview } = this.extractEmailContent(message.payload)

			return {
				id: message.id,
				threadId: message.threadId,
				snippet: message.snippet || '',
				subject: getHeader('Subject'),
				from: getHeader('From'),
				date: message.internalDate 
					? new Date(parseInt(message.internalDate)).toISOString()
					: getHeader('Date'),
				labels: message.labelIds || [],
				textContent,
				htmlContent,
				bodyPreview,
			}
		} catch (error) {
			console.error('Error parsing email data with content:', error)
			return null
		}
	}

	/**
	 * Extract text and HTML content from Gmail message payload
	 */
	private extractEmailContent(payload: gmail_v1.Schema$MessagePart | undefined): {
		textContent?: string
		htmlContent?: string
		bodyPreview: string
	} {
		let textContent: string | undefined
		let htmlContent: string | undefined
		let bodyPreview = ''

		if (!payload) {
			return { bodyPreview }
		}

		// Recursive function to traverse message parts
		const traverseParts = (part: gmail_v1.Schema$MessagePart) => {
			if (part.mimeType === 'text/plain' && part.body?.data) {
				textContent = Buffer.from(part.body.data, 'base64').toString('utf-8')
				bodyPreview = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')
			} else if (part.mimeType === 'text/html' && part.body?.data) {
				htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8')
				// If no text content, extract preview from HTML (basic)
				if (!bodyPreview && htmlContent) {
					// Simple HTML tag removal for preview
					const textFromHtml = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
					bodyPreview = textFromHtml.substring(0, 200) + (textFromHtml.length > 200 ? '...' : '')
				}
			}

			// Recursively check parts
			if (part.parts) {
				part.parts.forEach(traverseParts)
			}
		}

		// Handle single part or multipart messages
		if (payload.parts) {
			payload.parts.forEach(traverseParts)
		} else {
			traverseParts(payload)
		}

		return { textContent, htmlContent, bodyPreview }
	}

	/**
	 * Fetch emails from Gmail
	 */
	async fetchEmails(
		accessToken: string, 
		maxResults: number = 10,
		query: string = ''
	): Promise<EmailData[]> {
		try {
			// Create OAuth2 client with access token
			const oauth2Client = new google.auth.OAuth2(
				process.env.GOOGLE_CLIENT_ID,
				process.env.GOOGLE_CLIENT_SECRET
			)
			
			oauth2Client.setCredentials({ access_token: accessToken })
			
			const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

			// List messages
			const response = await gmail.users.messages.list({
				userId: 'me',
				maxResults,
				q: query,
			})

			const messages = response.data.messages || []
			const emails: EmailData[] = []

			// Fetch details for each message
			for (const message of messages) {
				if (message.id) {
					const messageDetail = await gmail.users.messages.get({
						userId: 'me',
						id: message.id,
					})

					const emailData = this.parseEmailData(messageDetail.data)
					if (emailData) {
						emails.push(emailData)
					}
				}
			}

			return emails
		} catch (error) {
			console.error('Error fetching emails:', error)
			throw new Error(`Failed to fetch emails: ${error}`)
		}
	}

	/**
	 * Parse Gmail message data into our EmailData format
	 */
	private parseEmailData(message: gmail_v1.Schema$Message): EmailData | null {
		try {
			if (!message.id || !message.threadId) {
				return null
			}

			const headers = message.payload?.headers || []
			
			const getHeader = (name: string): string => {
				const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase())
				return header?.value || ''
			}

			return {
				id: message.id,
				threadId: message.threadId,
				snippet: message.snippet || '',
				subject: getHeader('Subject'),
				from: getHeader('From'),
				date: message.internalDate 
					? new Date(parseInt(message.internalDate)).toISOString()
					: getHeader('Date'),
				labels: message.labelIds || [],
			}
		} catch (error) {
			console.error('Error parsing email data:', error)
			return null
		}
	}

	/**
	 * 🚀 Fetch emails from a specific period (number of days back)
	 * Uses parallel Promise.all() approach for better performance
	 * Fetches emails from the specified number of days for comprehensive analysis
	 */
	async fetchEmailsFromPeriod(
		accessToken: string,
		daysBack: number,
		maxResults?: number // Optional limit for testing, defaults to ALL emails
	): Promise<EmailDataWithContent[]> {
		try {
			console.log(`🔍 Fetching emails from the last ${daysBack} days with full content...`)
			
			// Create OAuth2 client with access token
			const oauth2Client = new google.auth.OAuth2(
				process.env.GOOGLE_CLIENT_ID,
				process.env.GOOGLE_CLIENT_SECRET
			)
			
			oauth2Client.setCredentials({ access_token: accessToken })
			const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

			// Step 1: Fetch ALL messages with pagination
			const allMessages: any[] = []
			let pageToken: string | undefined
			let requestCount = 0
			const maxRequestsPerPage = 100 // Gmail's maximum per request

			do {
				requestCount++
				console.log(`📄 Fetching page ${requestCount} of emails from last ${daysBack} days...`)
				
				const messageList = await gmail.users.messages.list({
					userId: 'me',
					maxResults: maxRequestsPerPage,
					q: `newer_than:${daysBack}d`, // Emails from the specified number of days
					pageToken,
				})

				const messages = messageList.data.messages || []
				allMessages.push(...messages)
				pageToken = messageList.data.nextPageToken || undefined

				console.log(`📧 Page ${requestCount}: Found ${messages.length} messages (Total so far: ${allMessages.length})`)

				// Safety check - if user specified maxResults, respect it
				if (maxResults && allMessages.length >= maxResults) {
					console.log(`⚠️ Reached specified limit of ${maxResults} emails`)
					break
				}

				// Safety check - prevent infinite loops (max 10 pages = 1000 emails)
				if (requestCount >= 10) {
					console.log(`⚠️ Reached maximum page limit (10 pages). Total emails: ${allMessages.length}`)
					break
				}

			} while (pageToken)

			console.log(`📧 Total messages found from last ${daysBack} days: ${allMessages.length}`)

			if (allMessages.length === 0) {
				return []
			}

			// Limit to maxResults if specified
			const messagesToProcess = maxResults 
				? allMessages.slice(0, maxResults)
				: allMessages

			console.log(`📧 Processing ${messagesToProcess.length} messages`)

			// Step 2: Parallel fetch all message details with rate limiting
			console.log('⚡ Fetching full content in parallel...')
			
			// Add small delay between requests to avoid rate limiting
			const fetchWithDelay = async (messageId: string, index: number) => {
				// Small staggered delay to avoid hitting rate limits
				if (index > 0) {
					await new Promise(resolve => setTimeout(resolve, 30 * (index % 10))) // Stagger every 10 requests
				}
				
				return gmail.users.messages.get({
					userId: 'me',
					id: messageId,
					format: 'full', // Get full message content
				})
			}

			// Step 3: Execute all requests in parallel (in batches)
			const batchSize = 20 // Process in smaller batches to avoid rate limits
			const emailsWithContent: EmailDataWithContent[] = []

			for (let i = 0; i < messagesToProcess.length; i += batchSize) {
				const batch = messagesToProcess.slice(i, i + batchSize)
				console.log(`⚡ Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messagesToProcess.length / batchSize)} (${batch.length} emails)`)

				const batchPromises = batch.map((msg, index) => 
					msg.id ? fetchWithDelay(msg.id, index) : null
				).filter(Boolean)

				const batchResults = await Promise.all(batchPromises)
				
				// Parse batch results
				for (const messageResponse of batchResults) {
					if (messageResponse?.data) {
						const emailData = this.parseEmailDataWithContent(messageResponse.data)
						if (emailData) {
							emailsWithContent.push(emailData)
						}
					}
				}

				console.log(`✅ Batch completed. Total processed so far: ${emailsWithContent.length}`)
			}

			console.log(`🎯 Successfully parsed ${emailsWithContent.length} emails with content from last ${daysBack} days`)
			return emailsWithContent

		} catch (error) {
			console.error(`❌ Error fetching emails from last ${daysBack} days:`, error)
			throw new Error(`Failed to fetch emails from last ${daysBack} days: ${error}`)
		}
	}
}

// Create singleton instance
const gmailService = new GmailService()

// Export only the functions that are actually used
export const getGmailAuthUrl = () => gmailService.getAuthUrl()
export const fetchGmailEmails = (accessToken: string, maxResults?: number, query?: string) => 
	gmailService.fetchEmails(accessToken, maxResults, query)
export const fetchTodaysEmailsWithContent = (accessToken: string, maxResults?: number) => 
	gmailService.fetchTodaysEmailsWithContent(accessToken, maxResults)
export const fetchEmailsFromPeriod = (accessToken: string, daysBack: number, maxResults?: number) => 
	gmailService.fetchEmailsFromPeriod(accessToken, daysBack, maxResults)
