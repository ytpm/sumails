import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { deleteConnectedAccount, getValidCredentials, updateAccountStatus } from '@/lib/mailboxes/service'
import { fetchTodaysEmailsWithContent } from '@/lib/google/actions'

// DELETE /api/connected-accounts/[id] - Delete a connected account
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const accountId = parseInt(params.id)
		
		if (isNaN(accountId)) {
			return NextResponse.json(
				{ error: 'Invalid account ID' },
				{ status: 400 }
			)
		}

		// Get the current user from Supabase
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 }
			)
		}

		// Delete the connected account
		await deleteConnectedAccount(user.id, accountId)

		return NextResponse.json({ success: true })

	} catch (error) {
		console.error('Error deleting connected account:', error)
		return NextResponse.json(
			{ error: 'Failed to delete connected account' },
			{ status: 500 }
		)
	}
}

// POST /api/connected-accounts/[id]/sync - Sync a connected account
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const accountId = parseInt(params.id)
		
		if (isNaN(accountId)) {
			return NextResponse.json(
				{ error: 'Invalid account ID' },
				{ status: 400 }
			)
		}

		// Get the current user from Supabase
		const supabase = await createClient()
		const { data: { user }, error: userError } = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json(
				{ error: 'User not authenticated' },
				{ status: 401 }
			)
		}

		// Get valid credentials (refresh if needed)
		const account = await getValidCredentials(user.id, accountId)
		
		if (!account) {
			return NextResponse.json(
				{ error: 'Account not found or credentials invalid' },
				{ status: 404 }
			)
		}

		// Test the connection by fetching today's emails
		try {
			const emails = await fetchTodaysEmailsWithContent(account.access_token, 1) // Just fetch 1 email to test
			
			// Update account status to active
			await updateAccountStatus(accountId, 'active', new Date())
			
			return NextResponse.json({ 
				success: true, 
				message: 'Account synced successfully',
				emailCount: emails.length 
			})
		} catch (syncError) {
			console.error('Sync error:', syncError)
			
			// Update account status to error
			await updateAccountStatus(accountId, 'error')
			
			return NextResponse.json(
				{ error: 'Failed to sync account - check credentials' },
				{ status: 400 }
			)
		}

	} catch (error) {
		console.error('Error syncing connected account:', error)
		return NextResponse.json(
			{ error: 'Failed to sync connected account' },
			{ status: 500 }
		)
	}
} 