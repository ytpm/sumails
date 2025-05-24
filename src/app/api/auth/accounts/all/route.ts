import { NextResponse } from 'next/server'
import { readJsonFile } from '@/lib/json_handler'
import { isTokenExpired, refreshAccessToken } from '@/lib/google/credentials'
import type { ConnectedAccount } from '@/types/auth'

export async function GET() {
	try {
		// Load all connected accounts
		const accounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
		
		// Process each account and refresh tokens if needed
		const processedAccounts = await Promise.allSettled(
			accounts.map(async (account) => {
				try {
					// Check if token is expired
					if (isTokenExpired(account)) {
						console.log(`🔄 Token expired for ${account.email}, attempting refresh...`)
						
						// Try to refresh the token
						const refreshedAccount = await refreshAccessToken(account)
						console.log(`✅ Successfully refreshed token for ${account.email}`)
						
						return {
							email: refreshedAccount.email,
							userId: refreshedAccount.userId,
							isExpired: false
						}
					} else {
						// Token is still valid
						return {
							email: account.email,
							userId: account.userId,
							isExpired: false
						}
					}
				} catch (error) {
					// Failed to refresh token - mark as expired
					console.error(`❌ Failed to refresh token for ${account.email}:`, error)
					return {
						email: account.email,
						userId: account.userId,
						isExpired: true
					}
				}
			})
		)

		// Extract successful results
		const accountInfo = processedAccounts.map(result => {
			if (result.status === 'fulfilled') {
				return result.value
			} else {
				// If promise was rejected, this shouldn't happen with our try-catch, but handle it
				console.error('Unexpected promise rejection:', result.reason)
				return {
					email: 'unknown',
					userId: 'unknown',
					isExpired: true
				}
			}
		}).filter(account => account.email !== 'unknown') // Filter out any unknown accounts

		console.log(`📧 Loaded ${accountInfo.length} accounts, ${accountInfo.filter(acc => !acc.isExpired).length} active, ${accountInfo.filter(acc => acc.isExpired).length} expired`)

		return NextResponse.json({ accounts: accountInfo })
	} catch (error) {
		console.error('Error loading all accounts:', error)
		return NextResponse.json(
			{ error: 'Failed to load accounts' },
			{ status: 500 }
		)
	}
} 