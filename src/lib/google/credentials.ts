import { google } from 'googleapis'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'
import type { ConnectedAccount, GoogleTokens, UserInfo } from '@/types/auth'

/**
 * Get user info from Google API using access token
 */
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET
	)
	oauth2Client.setCredentials({ access_token: accessToken })
	
	const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
	const { data } = await oauth2.userinfo.get()
	
	if (!data.id || !data.email) {
		throw new Error('Failed to get user info from Google')
	}
	
	return {
		id: data.id,
		email: data.email,
		name: data.name || '',
		picture: data.picture || undefined
	}
}

/**
 * Save Google OAuth credentials to JSON file
 */
export async function saveCredentials(
	tokens: GoogleTokens,
	userInfo: UserInfo
): Promise<void> {
	if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
		throw new Error('Invalid tokens: missing required fields')
	}

	const accounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
	
	// Check if account already exists and update it
	const existingIndex = accounts.findIndex(
		acc => acc.userId === userInfo.id && acc.email === userInfo.email
	)
	
	const newAccount: ConnectedAccount = {
		userId: userInfo.id,
		email: userInfo.email,
		accessToken: tokens.access_token,
		refreshToken: tokens.refresh_token,
		expiresAt: new Date(tokens.expiry_date).toISOString()
	}
	
	if (existingIndex >= 0) {
		// Update existing account
		accounts[existingIndex] = newAccount
		console.log(`📝 Updated credentials for ${userInfo.email}`)
	} else {
		// Add new account
		accounts.push(newAccount)
		console.log(`✅ Saved new credentials for ${userInfo.email}`)
	}
	
	await writeJsonFile('connected_accounts.json', accounts)
}

/**
 * Load credentials for a specific user and email
 */
export async function loadCredentials(
	userId: string,
	email: string
): Promise<ConnectedAccount | null> {
	const accounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
	
	const account = accounts.find(
		acc => acc.userId === userId && acc.email === email
	)
	
	if (account) {
		console.log(`🔑 Loaded credentials for ${email}`)
		return account
	}
	
	console.log(`❌ No credentials found for ${email}`)
	return null
}

/**
 * Load all connected accounts for a specific user
 */
export async function loadUserAccounts(userId: string): Promise<ConnectedAccount[]> {
	const accounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
	
	const userAccounts = accounts.filter(acc => acc.userId === userId)
	console.log(`📧 Found ${userAccounts.length} connected accounts for user ${userId}`)
	
	return userAccounts
}

/**
 * Check if credentials are expired
 */
export function isTokenExpired(account: ConnectedAccount): boolean {
	const now = new Date()
	const expiresAt = new Date(account.expiresAt)
	
	// Add 5 minute buffer before expiry
	const bufferTime = 5 * 60 * 1000
	return now.getTime() > (expiresAt.getTime() - bufferTime)
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(account: ConnectedAccount): Promise<ConnectedAccount> {
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET
	)
	
	oauth2Client.setCredentials({ refresh_token: account.refreshToken })
	
	try {
		const { credentials } = await oauth2Client.refreshAccessToken()
		
		if (!credentials.access_token || !credentials.expiry_date) {
			throw new Error('Failed to refresh token')
		}
		
		const updatedAccount: ConnectedAccount = {
			...account,
			accessToken: credentials.access_token,
			expiresAt: new Date(credentials.expiry_date).toISOString()
		}
		
		// Save updated credentials
		const accounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
		const index = accounts.findIndex(
			acc => acc.userId === account.userId && acc.email === account.email
		)
		
		if (index >= 0) {
			accounts[index] = updatedAccount
			await writeJsonFile('connected_accounts.json', accounts)
			console.log(`🔄 Refreshed access token for ${account.email}`)
		}
		
		return updatedAccount
	} catch (error) {
		console.error(`❌ Failed to refresh token for ${account.email}:`, error)
		throw new Error('Failed to refresh access token')
	}
}

/**
 * Get valid credentials (refresh if needed)
 */
export async function getValidCredentials(
	userId: string,
	email: string
): Promise<ConnectedAccount | null> {
	let account = await loadCredentials(userId, email)
	
	if (!account) {
		return null
	}
	
	if (isTokenExpired(account)) {
		console.log(`🔄 Token expired for ${email}, refreshing...`)
		try {
			account = await refreshAccessToken(account)
		} catch (error) {
			console.error(`❌ Failed to refresh token for ${email}`, error)
			return null
		}
	}
	
	return account
} 