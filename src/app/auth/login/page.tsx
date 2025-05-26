import { Metadata } from 'next'
import LoginClient from '@/components/auth/LoginClient'

export const metadata: Metadata = {
	title: 'Login | Sumails',
	description: 'Sign in to your Sumails account',
}

export default function LoginPage() {
	return <LoginClient />
} 