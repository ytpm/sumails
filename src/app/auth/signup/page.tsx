import { Metadata } from 'next'
import SignupClient from '@/components/auth/SignupClient'

export const metadata: Metadata = {
	title: 'Sign Up | Sumails',
	description: 'Create your Sumails account',
}

export default function SignupPage() {
	return <SignupClient />
} 