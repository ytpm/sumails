import { NextResponse } from 'next/server'
import { readJsonFile } from '@/lib/json_handler'

interface EmailDigest {
	id: string
	userId: string
	accountId: string
	date: string
	summary: string
	highlights: Array<{
		subject: string
		from: string
	}>
	suggestion: string
	created_at: string
}

interface ConnectedAccount {
	userId: string
	email: string
	accessToken: string
	refreshToken: string
	expiresAt: string
}

interface TodayDigestWithAccount {
	digest: EmailDigest
	accountEmail: string
	isExpired: boolean
}

export async function GET() {
	try {
		const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

		// Load email digests and connected accounts
		const [digests, accounts] = await Promise.all([
			readJsonFile<EmailDigest>('email_digests.json').catch(() => []),
			readJsonFile<ConnectedAccount>('connected_accounts.json').catch(() => [])
		])

		// Filter digests for today
		const todayDigests = digests.filter(digest => digest.date === today)

		// Enrich digests with account information
		const enrichedDigests: TodayDigestWithAccount[] = todayDigests.map(digest => {
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
			date: today,
			digests: enrichedDigests,
			total: enrichedDigests.length
		})

	} catch (error) {
		console.error('Error fetching today\'s digests:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch today\'s email digests' },
			{ status: 500 }
		)
	}
} 