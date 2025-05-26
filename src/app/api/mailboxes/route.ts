import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getUserConnectedAccounts, deleteConnectedAccount } from '@/lib/services/mailboxes'
import { createClient } from '@/utils/supabase/server'

// GET /api/mailboxes - Fetch user's mailboxes
export async function GET(request: NextRequest) {
	try {
		// Get the current user from Supabase
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 }
			)
		}

		// Fetch connected accounts
		const accounts = await getUserConnectedAccounts(user.id)

		return NextResponse.json({ accounts })

	} catch (error) {
		console.error('Error fetching connected accounts:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch connected accounts' },
			{ status: 500 }
		)
	}
}

// POST /api/mailboxes - Initiate OAuth flow
export async function POST(request: NextRequest) {
	try {
		// Get the current user from Supabase
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 }
			)
		}

		// Create OAuth2 client
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.NODE_ENV === 'production' 
				? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
				: 'http://localhost:3000/api/auth/callback'
		)

		// Generate OAuth URL
		const scopes = [
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile'
		]

		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: scopes,
			prompt: 'consent',
			state: user.id // Pass user ID as state for security
		})

		return NextResponse.json({ authUrl })

	} catch (error) {
		console.error('Error generating OAuth URL:', error)
		return NextResponse.json(
			{ error: 'Failed to generate OAuth URL' },
			{ status: 500 }
		)
	}
} 