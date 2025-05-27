import type { Tables, TablesInsert, TablesUpdate } from './supabase'

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

// Summarized message metadata stored in JSON (legacy - for backward compatibility)
export interface SummarizedMessage {
	id: string
	accountId: string
	summarized_at: string
}

// Cleaned message structure for OpenAI summarization (legacy - for backward compatibility)
export interface CleanedMessage {
	id: string
	subject: string
	from: string
	date: string
	snippet: string
}

// Enhanced cleaned message for OpenAI with full content (legacy - for backward compatibility)
export interface CleanedMessageWithContent extends CleanedMessage {
	textContent?: string
	htmlContent?: string
	bodyPreview: string
}

// Summary data structure returned by OpenAI (stored in summary_data JSONB column)
export interface SummaryData {
	overview: string[]
	insight: string
	important_emails: Array<{
		subject: string
		sender: string
		reason: string
	}>
	suggestions?: string[]
}

// Inbox status enum for type safety
export type InboxStatus = 'attention_needed' | 'worth_a_look' | 'all_clear'

// Use Supabase types directly now that schema is updated
export type EmailSummaryRow = Tables<'email_summaries'>
export type EmailSummaryInsert = TablesInsert<'email_summaries'>
export type EmailSummaryUpdate = TablesUpdate<'email_summaries'>

// Enhanced summary with account information for UI display
export interface EmailSummaryWithAccount extends EmailSummaryRow {
	account_email?: string
	account_provider?: string
}

// Legacy EmailDigest interface - keeping for backward compatibility
// TODO: Remove this once all code is migrated to use EmailSummaryRow
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