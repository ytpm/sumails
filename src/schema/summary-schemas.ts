import { z } from 'zod'

/**
 * Schema for validating OpenAI summary response structure
 * This ensures the AI returns data in the expected format
 */
export const SummaryResponseSchema = z.object({
	overview: z.array(z.string()).min(1).max(5),
	insight: z.string().min(1).max(500),
	important_emails: z.array(z.object({
		subject: z.string(),
		sender: z.string(),
		reason: z.string()
	})).max(5),
	inbox_status: z.enum(['attention_needed', 'worth_a_look', 'all_clear']),
	suggestions: z.array(z.string()).max(3).optional()
})

/**
 * Schema for validating summary data structure stored in database
 * This matches the SummaryData interface
 */
export const SummaryDataSchema = z.object({
	overview: z.array(z.string()),
	insight: z.string(),
	important_emails: z.array(z.object({
		subject: z.string(),
		sender: z.string(),
		reason: z.string()
	})),
	suggestions: z.array(z.string()).optional()
})

/**
 * Schema for validating inbox status values
 */
export const InboxStatusSchema = z.enum(['attention_needed', 'worth_a_look', 'all_clear'])

/**
 * Schema for validating date format (YYYY-MM-DD)
 */
export const DateProcessedSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

/**
 * Schema for validating email summary creation data
 */
export const EmailSummaryCreateSchema = z.object({
	user_id: z.string().uuid(),
	connected_account_id: z.string().uuid(),
	email_count: z.number().int().min(0),
	inbox_status: InboxStatusSchema,
	date_processed: DateProcessedSchema,
	summary_data: SummaryDataSchema,
	summary_text: z.string().optional(),
	date_range_start: z.string().optional(),
	date_range_end: z.string().optional()
})

/**
 * Schema for validating email summary update data
 */
export const EmailSummaryUpdateSchema = z.object({
	email_count: z.number().int().min(0).optional(),
	inbox_status: InboxStatusSchema.optional(),
	summary_data: SummaryDataSchema.optional(),
	delivery_status: z.enum(['sent', 'failed', 'pending']).optional(),
	sent_at: z.string().datetime().optional(),
	sent_via: z.enum(['email', 'whatsapp']).optional()
})

// Export types inferred from schemas for use in TypeScript
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>
export type SummaryDataType = z.infer<typeof SummaryDataSchema>
export type InboxStatusType = z.infer<typeof InboxStatusSchema>
export type EmailSummaryCreate = z.infer<typeof EmailSummaryCreateSchema>
export type EmailSummaryUpdateType = z.infer<typeof EmailSummaryUpdateSchema> 