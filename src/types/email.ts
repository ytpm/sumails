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