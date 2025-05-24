import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import type { gmail_v1 } from 'googleapis'

// Define types for better type safety
interface EmailData {
	id: string
	threadId: string
	snippet: string
	subject: string
	from: string
	date: string
	labels: string[]
}

class GmailService {
	private auth: GoogleAuth
	private gmail: gmail_v1.Gmail | null = null

	constructor() {
		this.auth = new GoogleAuth({
			scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
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

		const scopes = ['https://www.googleapis.com/auth/gmail.readonly']

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
