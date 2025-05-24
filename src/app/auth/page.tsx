'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const error = searchParams.get('error')

	useEffect(() => {
		// If no error, redirect to dashboard
		if (!error) {
			router.push('/dashboard')
		}
	}, [error, router])

	const getErrorMessage = (errorCode: string | null) => {
		switch (errorCode) {
			case 'oauth_error':
				return 'There was an error during OAuth authentication.'
			case 'no_code':
				return 'No authorization code was received from Google.'
			case 'callback_error':
				return 'There was an error processing the OAuth callback.'
			default:
				return 'An unknown error occurred during authentication.'
		}
	}

	if (!error) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Redirecting to dashboard...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="bg-card rounded-lg shadow-lg border border-border p-8">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-4">
							<svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						
						<h2 className="text-2xl font-bold text-card-foreground mb-4">
							Authentication Error
						</h2>
						
						<p className="text-muted-foreground mb-6">
							{getErrorMessage(error)}
						</p>
						
						<div className="space-y-3">
							<Button
								onClick={() => router.push('/dashboard')}
								className="w-full"
							>
								Try Again
							</Button>
							
							<Button
								variant="outline"
								onClick={() => router.push('/')}
								className="w-full"
							>
								Go Home
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
} 