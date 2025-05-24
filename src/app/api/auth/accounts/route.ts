import { NextRequest, NextResponse } from 'next/server'
import { loadUserAccounts, getValidCredentials } from '@/lib/google/credentials'

export async function POST(request: NextRequest) {
	try {
		const { userId } = await request.json()

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			)
		}

		// Load all connected accounts for the user
		const accounts = await loadUserAccounts(userId)
		
		// Return account info (without sensitive tokens)
		const accountInfo = accounts.map(account => ({
			email: account.email,
			userId: account.userId,
			isExpired: new Date() > new Date(account.expiresAt)
		}))

		return NextResponse.json({ accounts: accountInfo })
	} catch (error) {
		console.error('Error loading accounts:', error)
		return NextResponse.json(
			{ error: 'Failed to load accounts' },
			{ status: 500 }
		)
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')
		const email = searchParams.get('email')

		if (!userId || !email) {
			return NextResponse.json(
				{ error: 'User ID and email are required' },
				{ status: 400 }
			)
		}

		// Get valid credentials (will refresh if needed)
		const account = await getValidCredentials(userId, email)
		
		if (!account) {
			return NextResponse.json(
				{ error: 'Account not found or token expired' },
				{ status: 404 }
			)
		}

		// Return account info with access token for API calls
		return NextResponse.json({
			email: account.email,
			accessToken: account.accessToken,
			expiresAt: account.expiresAt
		})
	} catch (error) {
		console.error('Error getting account credentials:', error)
		return NextResponse.json(
			{ error: 'Failed to get credentials' },
			{ status: 500 }
		)
	}
} 