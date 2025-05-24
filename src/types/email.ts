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

// Summarized message metadata stored in JSON
export interface SummarizedMessage {
	id: string
	account_id: string
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