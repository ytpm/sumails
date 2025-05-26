import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getUserConnectedAccounts } from '@/lib/services/mailboxes'
import MailboxesClient from '@/components/account/MailboxesClient'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Mailboxes | Sumails',
	description: 'Manage your connected email mailboxes',
}

export default async function MailboxesPage() {
	// Get the current user from Supabase
	const supabase = await createClient()
	const { data: { user }, error: userError } = await supabase.auth.getUser()

	// Redirect to login if not authenticated
	if (userError || !user) {
		redirect('/auth/login')
	}

	// Fetch connected accounts from Supabase
	try {
		const connectedAccounts = await getUserConnectedAccounts(user.id)
		return <MailboxesClient initialAccounts={connectedAccounts} />
	} catch (error) {
		console.error('Error fetching connected accounts:', error)
		// Return empty array if there's an error, let the client handle it
		return <MailboxesClient initialAccounts={[]} />
	}
} 