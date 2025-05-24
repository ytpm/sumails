import { NextRequest, NextResponse } from 'next/server'
import { fetchGmailEmails } from '@/lib/google/actions'

export async function POST(request: NextRequest) {
	try {
		const { accessToken, maxResults = 10, query = '' } = await request.json()

		if (!accessToken) {
			return NextResponse.json(
				{ error: 'Access token is required' },
				{ status: 400 }
			)
		}

		const emails = await fetchGmailEmails(accessToken, maxResults, query)
		console.log(`🔍 Fetched ${emails.length} emails: ${JSON.stringify(emails)}`)

		return NextResponse.json({ emails })
	} catch (error) {
		console.error('Error fetching emails:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch emails' },
			{ status: 500 }
		)
	}
} 