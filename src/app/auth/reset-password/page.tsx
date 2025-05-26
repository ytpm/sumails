import { Metadata } from 'next'
import ResetPasswordClient from '@/components/auth/ResetPasswordClient'

export const metadata: Metadata = {
	title: 'Reset Password | Sumails',
	description: 'Reset your Sumails account password',
}

export default function ResetPasswordPage() {
	return <ResetPasswordClient />
} 