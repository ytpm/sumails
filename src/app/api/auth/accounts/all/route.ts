import { NextResponse } from 'next/server'
import { readJsonFile } from '@/lib/json_handler'
import type { ConnectedAccount } from '@/types/auth'

export async function GET() {
	try {
		// Load all connected accounts
		const accounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
		
		// Return basic account info (without sensitive tokens)
		const accountInfo = accounts.map(account => ({
			email: account.email,
			userId: account.userId,
			isExpired: new Date() > new Date(account.expiresAt)
		}))

		return NextResponse.json({ accounts: accountInfo })
	} catch (error) {
		console.error('Error loading all accounts:', error)
		return NextResponse.json(
			{ error: 'Failed to load accounts' },
			{ status: 500 }
		)
	}
} 