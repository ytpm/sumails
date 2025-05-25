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
	 * Set credentials from OAuth callback
	 */
	async setCredentials(code: string) {
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.NODE_ENV === 'production' 
				? 'https://your-domain.com/api/auth/callback' 
				: 'http://localhost:3000/api/auth/callback'
		)

		const { tokens } = await oauth2Client.getToken(code)
		oauth2Client.setCredentials(tokens)
		
		// Store tokens securely (you might want to use a database or session storage)
		return tokens
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
	 * 🧠 Enhanced parser: Extract text content from Gmail message payload
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

			// Extract content from payload parts
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
	 * 🧱 Extract text/HTML content and create preview
	 * Finds text/plain, falls back to text/html, decodes Base64
	 */
	private extractEmailContent(payload: gmail_v1.Schema$MessagePart | undefined): {
		textContent?: string
		htmlContent?: string
		bodyPreview: string
	} {
		let textContent: string | undefined
		let htmlContent: string | undefined

		if (!payload) {
			return { textContent, htmlContent, bodyPreview: 'No content available' }
		}

		// Recursive function to traverse message parts
		const traverseParts = (part: gmail_v1.Schema$MessagePart) => {
			const mimeType = part.mimeType || ''

			// Extract text/plain content (preferred)
			if (mimeType === 'text/plain' && part.body?.data) {
				try {
					textContent = Buffer.from(part.body.data, 'base64url').toString('utf-8')
				} catch (error) {
					console.warn('Failed to decode text/plain content:', error)
				}
			}
			
			// Extract HTML content (fallback)
			if (mimeType === 'text/html' && part.body?.data) {
				try {
					htmlContent = Buffer.from(part.body.data, 'base64url').toString('utf-8')
				} catch (error) {
					console.warn('Failed to decode text/html content:', error)
				}
			}

			// Recursively process nested parts (for multipart messages)
			if (part.parts) {
				part.parts.forEach(traverseParts)
			}
		}

		// Start traversal
		traverseParts(payload)

		// Create best available preview
		let bodyPreview = 'No content available'
		if (textContent) {
			// Use plain text (preferred)
			bodyPreview = textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '')
		} else if (htmlContent) {
			// Strip HTML tags for preview
			const strippedHtml = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
			bodyPreview = strippedHtml.substring(0, 500) + (strippedHtml.length > 500 ? '...' : '')
		}

		return { textContent, htmlContent, bodyPreview }
	}

	/**
	 * 📊 Enhanced console logging with full content
	 * Fetches ALL today's emails for comprehensive analysis
	 */
	async listTodaysEmailsWithContentToConsole(
		accessToken: string, 
		maxResults?: number // Optional limit for testing
	): Promise<void> {
		try {
			console.log('🚀 Fetching ALL today\'s emails with full content...')
			const emails = await this.fetchTodaysEmailsWithContent(accessToken, maxResults)
			
			console.log(`\n📧 Found ${emails.length} emails from today:\n`)
			
			emails.forEach((email, index) => {
				console.log(`--- Email ${index + 1} ---`)
				console.log(`📎 ID: ${email.id}`)
				console.log(`📝 Subject: ${email.subject}`)
				console.log(`👤 From: ${email.from}`)
				console.log(`📅 Date: ${email.date}`)
				console.log(`🏷️  Labels: ${email.labels.join(', ')}`)
				console.log(`📄 Snippet: ${email.snippet}`)
				console.log(`📃 Content Preview: ${email.bodyPreview}`)
				
				if (email.textContent) {
					console.log(`📝 Has Text Content: ${email.textContent.length} characters`)
				}
				if (email.htmlContent) {
					console.log(`🌐 Has HTML Content: ${email.htmlContent.length} characters`)
				}
				
				console.log('-------------------\n')
			})

			console.log(`✅ Successfully listed ${emails.length} emails with content to console`)
		} catch (error) {
			console.error('❌ Error listing emails with content:', error)
			throw error
		}
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
	 * List emails to console (for testing purposes)
	 */
	async listEmailsToConsole(
		accessToken: string, 
		maxResults: number = 10,
		query: string = ''
	): Promise<void> {
		try {
			console.log('🔍 Fetching emails from Gmail...')
			const emails = await this.fetchEmails(accessToken, maxResults, query)
			
			console.log(`\n📧 Found ${emails.length} emails:\n`)
			
			emails.forEach((email, index) => {
				console.log(`--- Email ${index + 1} ---`)
				console.log(`📎 ID: ${email.id}`)
				console.log(`📝 Subject: ${email.subject}`)
				console.log(`👤 From: ${email.from}`)
				console.log(`📅 Date: ${email.date}`)
				console.log(`🏷️  Labels: ${email.labels.join(', ')}`)
				console.log(`📄 Snippet: ${email.snippet}`)
				console.log('-------------------\n')
			})

			console.log(`✅ Successfully listed ${emails.length} emails to console`)
		} catch (error) {
			console.error('❌ Error listing emails:', error)
			throw error
		}
	}
}

// Export singleton instance
export const gmailService = new GmailService()

// Export individual functions for convenience
export const getGmailAuthUrl = () => gmailService.getAuthUrl()
export const setGmailCredentials = (code: string) => gmailService.setCredentials(code)
export const fetchGmailEmails = (accessToken: string, maxResults?: number, query?: string) => 
	gmailService.fetchEmails(accessToken, maxResults, query)
export const listEmailsToConsole = (accessToken: string, maxResults?: number, query?: string) => 
	gmailService.listEmailsToConsole(accessToken, maxResults, query)

// New exports for today's emails with content
export const fetchTodaysEmailsWithContent = (accessToken: string, maxResults?: number) => 
	gmailService.fetchTodaysEmailsWithContent(accessToken, maxResults)

export const listTodaysEmailsWithContentToConsole = (accessToken: string, maxResults?: number) => 
	gmailService.listTodaysEmailsWithContentToConsole(accessToken, maxResults)
