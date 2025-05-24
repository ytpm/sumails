'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EmailData {
	id: string
	threadId: string
	snippet: string
	subject: string
	from: string
	date: string
	labels: string[]
}

export default function DashboardHomepage() {
	const [accessToken, setAccessToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [emailCount, setEmailCount] = useState(10)
	const [searchQuery, setSearchQuery] = useState('')
	const searchParams = useSearchParams()

	useEffect(() => {
		// Check if we have an access token from OAuth callback
		const token = searchParams.get('access_token')
		if (token) {
			setAccessToken(token)
			console.log('✅ Access token received from OAuth callback')
		}
	}, [searchParams])

	const handleGoogleAuth = async () => {
		try {
			console.log('🔗 Getting Google OAuth URL...')
			const response = await fetch('/api/auth/url')
			const data = await response.json()
			
			if (data.authUrl) {
				window.location.href = data.authUrl
			} else {
				console.error('❌ Failed to get auth URL')
			}
		} catch (error) {
			console.error('❌ Error getting auth URL:', error)
		}
	}

	const logEmailsToConsole = (emails: EmailData[]) => {
		console.log(`\n📧 Found ${emails.length} emails:\n`)
		
		emails.forEach((email, index) => {
			console.log(`--- Email ${index + 1} ---`)
			console.log(`📎 ID: ${email.id}`)
			console.log(`📝 Subject: ${email.subject}`)
			console.log(`👤 From: ${email.from}`)
			console.log(`📅 Date: ${email.date}`)
			console.log(`🏷️  Labels: ${email.labels.join(', ')}`)
			console.log(`📄 Snippet: ${email.snippet}`)
			console.log('-------------------\n')
		})

		console.log(`✅ Successfully listed ${emails.length} emails to console`)
	}

	const handleFetchEmails = async () => {
		if (!accessToken) {
			console.error('❌ No access token available. Please authenticate first.')
			return
		}

		setIsLoading(true)
		try {
			console.log('🔍 Fetching emails from Gmail...')
			console.log(`🔍 Fetching ${emailCount} emails...`)
			if (searchQuery) {
				console.log(`🔎 Search query: "${searchQuery}"`)
			}
			
			const response = await fetch('/api/emails', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					accessToken,
					maxResults: emailCount,
					query: searchQuery,
				}),
			})

			const data = await response.json()
			
			if (data.emails) {
				logEmailsToConsole(data.emails)
			} else {
				console.error('❌ Failed to fetch emails:', data.error)
			}
		} catch (error) {
			console.error('❌ Error fetching emails:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<ContentView>
			{/* Authentication Section */}
			<div className="mb-8 p-6 bg-muted rounded-lg border">
				<h2 className="text-xl font-semibold mb-4">
					Authentication Status
				</h2>
				
				{!accessToken ? (
					<div>
						<p className="text-muted-foreground mb-4">
							You need to authenticate with Google to access Gmail emails.
						</p>
						<Button onClick={handleGoogleAuth}>
							🔐 Authenticate with Google
						</Button>
					</div>
				) : (
					<div>
						<p className="text-green-600 mb-2">
							✅ Successfully authenticated with Google!
						</p>
						<p className="text-sm text-muted-foreground">
							Access token: {accessToken.substring(0, 20)}...
						</p>
					</div>
				)}
			</div>

			{/* Email Fetching Section */}
			{accessToken && (
				<div className="mb-8 p-6 bg-muted rounded-lg border">
					<h2 className="text-xl font-semibold mb-4">
						Fetch Gmail Emails
					</h2>
					
					<div className="space-y-4">
						{/* Email Count Input */}
						<div>
							<label htmlFor="emailCount" className="block text-sm font-medium mb-2">
								Number of emails to fetch:
							</label>
							<Input
								id="emailCount"
								type="number"
								min="1"
								max="100"
								value={emailCount}
								onChange={(e) => setEmailCount(parseInt(e.target.value) || 10)}
							/>
						</div>

						{/* Search Query Input */}
						<div>
							<label htmlFor="searchQuery" className="block text-sm font-medium mb-2">
								Search query (optional):
							</label>
							<Input
								id="searchQuery"
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="e.g., from:example@gmail.com, subject:important, is:unread"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Use Gmail search operators like from:, subject:, is:unread, etc.
							</p>
						</div>

						{/* Fetch Button */}
						<Button
							onClick={handleFetchEmails}
							disabled={isLoading}
						>
							{isLoading ? '🔄 Fetching...' : '📧 Fetch Emails & Log to Console'}
						</Button>
					</div>
				</div>
			)}

			{/* Instructions Section */}
			<div className="p-6 bg-muted rounded-lg border">
				<h2 className="text-xl font-semibold mb-4">
					📋 Instructions
				</h2>
				
				<div className="space-y-4 text-sm text-muted-foreground">
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 1: Authentication</h3>
						<p>Click "Authenticate with Google" to connect your Gmail account. This will redirect you to Google's OAuth consent screen.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 2: Fetch Emails</h3>
						<p>Once authenticated, you can fetch emails from your Gmail account. Emails will be logged to the browser console.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 3: View Results</h3>
						<p>Open the browser console (F12) to see the detailed email data including subjects, senders, dates, and snippets.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Search Operators</h3>
						<p>You can use Gmail search operators like:</p>
						<ul className="list-disc list-inside mt-2 space-y-1">
							<li><code>from:example@gmail.com</code> - Emails from specific sender</li>
							<li><code>subject:important</code> - Emails with specific subject</li>
							<li><code>is:unread</code> - Unread emails only</li>
							<li><code>has:attachment</code> - Emails with attachments</li>
						</ul>
					</div>
				</div>
			</div>
		</ContentView>
	)
}