import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile, writeJsonFile } from '@/lib/json_handler'
import type { ConnectedAccount } from '@/types/auth'

export async function DELETE(request: NextRequest) {
	try {
		const { userId, email } = await request.json()

		if (!userId || !email) {
			return NextResponse.json(
				{ error: 'User ID and email are required' },
				{ status: 400 }
			)
		}

		// Load all connected accounts
		const accounts = await readJsonFile<ConnectedAccount>('connected_accounts.json')
		
		// Find the account to remove
		const accountIndex = accounts.findIndex(
			acc => acc.userId === userId && acc.email === email
		)

		if (accountIndex === -1) {
			return NextResponse.json(
				{ error: 'Account not found' },
				{ status: 404 }
			)
		}

		// Remove the account
		const removedAccount = accounts.splice(accountIndex, 1)[0]
		
		// Save updated accounts
		await writeJsonFile('connected_accounts.json', accounts)

		console.log(`🗑️ Disconnected account: ${removedAccount.email}`)

		return NextResponse.json({ 
			message: 'Account disconnected successfully',
			disconnectedEmail: removedAccount.email
		})
	} catch (error) {
		console.error('Error disconnecting account:', error)
		return NextResponse.json(
			{ error: 'Failed to disconnect account' },
			{ status: 500 }
		)
	}
} 