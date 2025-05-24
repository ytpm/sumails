import { NextResponse } from 'next/server'
import { getGmailAuthUrl } from '@/lib/google/actions'

export async function GET() {
	try {
		const authUrl = getGmailAuthUrl()
		return NextResponse.json({ authUrl })
	} catch (error) {
		console.error('Error generating auth URL:', error)
		return NextResponse.json(
			{ error: 'Failed to generate auth URL' },
			{ status: 500 }
		)
	}
} 