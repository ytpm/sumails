import { Metadata } from 'next'
import SettingsClient from '@/components/account/SettingsClient'

export const metadata: Metadata = {
	title: 'Account Settings | Sumails',
	description: 'Manage your Sumails account settings',
}

export default function SettingsPage() {
	return <SettingsClient />
} 