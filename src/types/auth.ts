export interface ConnectedAccount {
	userId: string
	email: string
	accessToken: string
	refreshToken: string
	expiresAt: string
}

export interface GoogleTokens {
	access_token?: string | null
	refresh_token?: string | null
	scope?: string | null
	token_type?: string | null
	expiry_date?: number | null
}

export interface UserInfo {
	id: string
	email: string
	name: string
	picture?: string
} 