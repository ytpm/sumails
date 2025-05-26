import { createClient } from '@/utils/supabase/server'
import { google } from 'googleapis'
import type { Database } from '@/types/supabase'
import type { GoogleTokens, UserInfo } from '@/types/auth'

type ConnectedAccountRow = Database['public']['Tables']['connected_accounts']['Row']
type ConnectedAccountInsert = Database['public']['Tables']['connected_accounts']['Insert']
type ConnectedAccountUpdate = Database['public']['Tables']['connected_accounts']['Update']

export interface ConnectedAccountWithStatus extends ConnectedAccountRow {
	status: 'active' | 'error' | 'expired'
	lastSync?: string
	emailCount?: number
}

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
 * Save Google OAuth credentials to Supabase
 */
export async function saveConnectedAccount(
	userId: string,
	tokens: GoogleTokens,
	userInfo: UserInfo
): Promise<ConnectedAccountRow> {
	if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
		throw new Error('Invalid tokens: missing required fields')
	}

	const supabase = await createClient(true) // Use service key for server operations
	
	// Check if account already exists
	const { data: existingAccount } = await supabase
		.from('connected_accounts')
		.select('*')
		.eq('user_id', userId)
		.eq('email', userInfo.email)
		.single()

	const accountData: ConnectedAccountInsert = {
		user_id: userId,
		email: userInfo.email,
		provider: 'Google',
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
		expires_at: new Date(tokens.expiry_date).toISOString()
	}

	if (existingAccount) {
		// Update existing account
		const { data, error } = await supabase
			.from('connected_accounts')
			.update(accountData)
			.eq('id', existingAccount.id)
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to update connected account: ${error.message}`)
		}

		console.log(`📝 Updated credentials for ${userInfo.email}`)
		return data
	} else {
		// Insert new account
		const { data, error } = await supabase
			.from('connected_accounts')
			.insert(accountData)
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to save connected account: ${error.message}`)
		}

		console.log(`✅ Saved new credentials for ${userInfo.email}`)
		return data
	}
}

/**
 * Get all connected accounts for a user
 */
export async function getUserConnectedAccounts(userId: string): Promise<ConnectedAccountWithStatus[]> {
	const supabase = await createClient(true)
	
	const { data, error } = await supabase
		.from('connected_accounts')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })

	if (error) {
		throw new Error(`Failed to fetch connected accounts: ${error.message}`)
	}

	// Add status information to each account
	const accountsWithStatus: ConnectedAccountWithStatus[] = data.map((account: ConnectedAccountRow) => {
		const now = new Date()
		const expiresAt = new Date(account.expires_at)
		const isExpired = now > expiresAt

		return {
			...account,
			status: isExpired ? 'expired' : 'active',
			lastSync: 'Never', // TODO: Implement last sync tracking
			emailCount: 0 // TODO: Implement email count tracking
		}
	})

	console.log(`📧 Found ${accountsWithStatus.length} connected accounts for user ${userId}`)
	return accountsWithStatus
}

/**
 * Get a specific connected account
 */
export async function getConnectedAccount(
	userId: string,
	accountId: number
): Promise<ConnectedAccountRow | null> {
	const supabase = await createClient(true)
	
	const { data, error } = await supabase
		.from('connected_accounts')
		.select('*')
		.eq('user_id', userId)
		.eq('id', accountId)
		.single()

	if (error) {
		if (error.code === 'PGRST116') {
			return null // Account not found
		}
		throw new Error(`Failed to fetch connected account: ${error.message}`)
	}

	return data
}

/**
 * Check if token is expired
 */
export function isTokenExpired(account: ConnectedAccountRow): boolean {
	const now = new Date()
	const expiresAt = new Date(account.expires_at)
	
	// Add 5 minute buffer before expiry
	const bufferTime = 5 * 60 * 1000
	return now.getTime() > (expiresAt.getTime() - bufferTime)
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(account: ConnectedAccountRow): Promise<ConnectedAccountRow> {
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET
	)
	
	oauth2Client.setCredentials({ refresh_token: account.refresh_token })
	
	try {
		const { credentials } = await oauth2Client.refreshAccessToken()
		
		if (!credentials.access_token || !credentials.expiry_date) {
			throw new Error('Failed to refresh token')
		}

		const supabase = await createClient(true)
		
		const updateData: ConnectedAccountUpdate = {
			access_token: credentials.access_token,
			expires_at: new Date(credentials.expiry_date).toISOString()
		}

		const { data, error } = await supabase
			.from('connected_accounts')
			.update(updateData)
			.eq('id', account.id)
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to update refreshed token: ${error.message}`)
		}
		
		console.log(`🔄 Refreshed access token for ${account.email}`)
		return data
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
	accountId: number
): Promise<ConnectedAccountRow | null> {
	let account = await getConnectedAccount(userId, accountId)
	
	if (!account) {
		return null
	}
	
	if (isTokenExpired(account)) {
		console.log(`🔄 Token expired for ${account.email}, refreshing...`)
		try {
			account = await refreshAccessToken(account)
		} catch (error) {
			console.error(`❌ Failed to refresh token for ${account.email}`, error)
			return null
		}
	}
	
	return account
}

/**
 * Delete a connected account
 */
export async function deleteConnectedAccount(
	userId: string,
	accountId: number
): Promise<void> {
	const supabase = await createClient(true)
	
	const { error } = await supabase
		.from('connected_accounts')
		.delete()
		.eq('user_id', userId)
		.eq('id', accountId)

	if (error) {
		throw new Error(`Failed to delete connected account: ${error.message}`)
	}

	console.log(`🗑️ Deleted connected account ${accountId}`)
}

/**
 * Update account status (for sync tracking)
 */
export async function updateAccountStatus(
	accountId: number,
	status: 'active' | 'error',
	lastSyncAt?: Date
): Promise<void> {
	// TODO: Implement status tracking in a separate table or add columns to connected_accounts
	// For now, we'll just log the status update
	console.log(`📊 Account ${accountId} status updated to: ${status}`)
	if (lastSyncAt) {
		console.log(`📊 Last sync: ${lastSyncAt.toISOString()}`)
	}
} 