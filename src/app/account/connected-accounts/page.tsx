import { Metadata } from 'next'
import ConnectedAccountsClient from '@/app/components/account/ConnectedAccountsClient'

export const metadata: Metadata = {
	title: 'Connected Accounts | Sumails',
	description: 'Manage your connected email accounts',
}

export default function ConnectedAccountsPage() {
	// TODO: In a real implementation, fetch connected accounts from Supabase here
	// For now, we'll pass empty array and let the client component handle the data fetching
	const connectedAccounts: any[] = []

	return <ConnectedAccountsClient initialAccounts={connectedAccounts} />
} 