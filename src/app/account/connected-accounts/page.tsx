import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getUserConnectedAccounts } from '@/lib/connected-accounts/service'
import ConnectedAccountsClient from '@/app/components/account/ConnectedAccountsClient'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Connected Accounts | Sumails',
	description: 'Manage your connected email accounts',
}

export default async function ConnectedAccountsPage() {
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
		return <ConnectedAccountsClient initialAccounts={connectedAccounts} />
	} catch (error) {
		console.error('Error fetching connected accounts:', error)
		// Return empty array if there's an error, let the client handle it
		return <ConnectedAccountsClient initialAccounts={[]} />
	}
} 