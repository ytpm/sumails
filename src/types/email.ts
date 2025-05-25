// Gmail message structure from Gmail API
export interface GmailMessage {
	id: string
	threadId: string
	snippet: string
	subject: string
	from: string
	date: string // ISO timestamp
	labels: string[]
}

// Enhanced Gmail message with full content for better AI summaries
export interface GmailMessageWithContent extends GmailMessage {
	textContent?: string
	htmlContent?: string
	bodyPreview: string // Best available content for AI processing
}

// Summarized message metadata stored in JSON
export interface SummarizedMessage {
	id: string
	accountId: string
	summarized_at: string
}

// Cleaned message structure for OpenAI summarization
export interface CleanedMessage {
	id: string
	subject: string
	from: string
	date: string
	snippet: string
}

// Enhanced cleaned message for OpenAI with full content
export interface CleanedMessageWithContent extends CleanedMessage {
	textContent?: string
	htmlContent?: string
	bodyPreview: string
}

// NEW/UPDATED EmailDigest interface
export interface EmailDigest {
	id: string // Unique ID for the digest
	userId: string
	accountId: string // Email address of the account
	date: string // YYYY-MM-DD format
	created_at: string // ISO timestamp of when the digest was created

	// Fields from the new AI output
	overview: string[]
	insight: string
	important_emails: Array<{
		subject: string
		sender: string
		reason: string
	}>
	inbox_status: 'attention_needed' | 'worth_a_look' | 'all_clear'
	suggestions?: string[]
} 