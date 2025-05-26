import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
	title: 'Check Your Email | Sumails',
	description: 'Please check your email to verify your account',
}

export default function CheckEmailPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
							<svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<CardTitle className="text-2xl font-bold">Check your email</CardTitle>
						<CardDescription>
							We've sent you a verification link
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-sm text-muted-foreground">
							Please check your email and click the verification link to activate your account. 
							If you don't see the email, check your spam folder.
						</p>
						
						<div className="space-y-2">
							<Link href="/auth/login">
								<Button className="w-full">
									Continue to sign in
								</Button>
							</Link>
							<Link href="/auth/signup">
								<Button variant="outline" className="w-full">
									Resend verification email
								</Button>
							</Link>
						</div>
						
						<p className="text-xs text-muted-foreground">
							Having trouble? Contact our support team for assistance.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 