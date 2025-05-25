export interface EmailData {
	id: string
	threadId: string
	snippet: string
	subject: string
	from: string
	date: string
	labels: string[]
}

export interface EmailDataWithContent extends EmailData {
	textContent?: string
	htmlContent?: string
	bodyPreview?: string
}

export interface UnsummarizedEmail {
	id: string
	subject: string
	snippet: string
	from: string
	internalDate?: string
	date?: string
	textContent?: string
	htmlContent?: string
	bodyPreview?: string
}

export interface UnsummarizedDebugData {
	userId: string
	accountEmail: string
	timestamp: string
	messages: UnsummarizedEmail[]
	contentStats?: {
		totalEmails: number
		withTextContent: number
		withHtmlContent: number
		avgContentLength: number
	}
} 