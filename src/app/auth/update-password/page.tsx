import { Metadata } from 'next'
import UpdatePasswordClient from '@/app/components/auth/UpdatePasswordClient'

export const metadata: Metadata = {
	title: 'Update Password | Sumails',
	description: 'Update your Sumails account password',
}

export default function UpdatePasswordPage() {
	return <UpdatePasswordClient />
} 