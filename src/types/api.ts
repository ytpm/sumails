import type { EmailDigest } from './email'

// API Response types
export interface DigestWithAccount {
	digest: EmailDigest
	accountEmail: string
	isExpired: boolean
}

export interface TodayDigestWithAccount extends DigestWithAccount {}

export interface DigestsResponse {
	success: boolean
	date: string
	digests: DigestWithAccount[]
	total: number
}

export interface TodayDigestsResponse extends DigestsResponse {
	digests: TodayDigestWithAccount[]
}

// Account display type for UI (transformed from ConnectedAccount)
export interface ConnectedAccountDisplay {
	email: string
	userId: string
	isExpired: boolean
}

// Processing logs
export interface AccountProcessingLog {
	id: string
	account_email: string
	userId: string
	date: string // YYYY-MM-DD
	last_processed_at: string // ISO timestamp
	emails_fetched: number
	emails_summarized: number
	digest_id?: string
	status: 'success' | 'failed' | 'no_new_emails'
} 