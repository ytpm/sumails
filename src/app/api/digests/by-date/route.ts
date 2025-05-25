import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile } from '@/lib/json_handler'
import type { EmailDigest } from '@/types/email'

interface ConnectedAccount {
	userId: string
	email: string
	accessToken: string
	refreshToken: string
	expiresAt: string
}

interface DigestWithAccount {
	digest: EmailDigest
	accountEmail: string
	isExpired: boolean
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const date = searchParams.get('date')

		if (!date) {
			return NextResponse.json(
				{ error: 'Date parameter is required (YYYY-MM-DD format)' },
				{ status: 400 }
			)
		}

		// Validate date format
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/
		if (!dateRegex.test(date)) {
			return NextResponse.json(
				{ error: 'Invalid date format. Use YYYY-MM-DD format' },
				{ status: 400 }
			)
		}

		// Load email digests and connected accounts
		const [digests, accounts] = await Promise.all([
			readJsonFile<EmailDigest>('email_digests.json').catch(() => []),
			readJsonFile<ConnectedAccount>('connected_accounts.json').catch(() => [])
		])

		// Filter digests for the specified date
		const dateDigests = digests.filter(digest => digest.date === date)

		// Enrich digests with account information
		const enrichedDigests: DigestWithAccount[] = dateDigests.map(digest => {
			const account = accounts.find(acc => acc.email === digest.accountId)
			
			return {
				digest,
				accountEmail: digest.accountId, // fallback to accountId if account not found
				isExpired: account ? new Date() > new Date(account.expiresAt) : true
			}
		})

		// Sort by creation time (most recent first)
		enrichedDigests.sort((a, b) => 
			new Date(b.digest.created_at).getTime() - new Date(a.digest.created_at).getTime()
		)

		return NextResponse.json({
			success: true,
			date,
			digests: enrichedDigests,
			total: enrichedDigests.length
		})

	} catch (error) {
		console.error('Error fetching digests by date:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch email digests for the specified date' },
			{ status: 500 }
		)
	}
} 