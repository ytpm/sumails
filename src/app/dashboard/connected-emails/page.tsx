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

interface ConnectedAccount {
	email: string
	userId: string
	isExpired: boolean
}

export default function ConnectedEmailsPage() {
	const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
	const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
	const [accessToken, setAccessToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [emailCount, setEmailCount] = useState(10)
	const [searchQuery, setSearchQuery] = useState('')
	const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null)
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)
	const [disconnectingAccount, setDisconnectingAccount] = useState<string | null>(null)
	const searchParams = useSearchParams()

	useEffect(() => {
		// Check if we just connected an account
		const connected = searchParams.get('connected')
		const connectedEmail = searchParams.get('email')
		
		if (connected === 'success' && connectedEmail) {
			setConnectionSuccess(connectedEmail)
			// Clear URL parameters
			window.history.replaceState({}, '', '/dashboard/connected-emails')
			// Reload accounts to show the newly connected account
			setTimeout(() => loadConnectedAccounts(), 500)
		} else {
			// Load connected accounts on initial page load
			loadConnectedAccounts()
		}
	}, [searchParams])

	const loadConnectedAccounts = async () => {
		try {
			// Load all accounts regardless of user ID (for development)
			const response = await fetch('/api/auth/accounts/all')
			const data = await response.json()
			
			if (data.accounts && data.accounts.length > 0) {
				setConnectedAccounts(data.accounts)
				// Set user ID to the first one found (for credential loading)
				setCurrentUserId(data.accounts[0].userId)
				console.log(`📧 Loaded ${data.accounts.length} connected accounts`)
			} else {
				// No accounts found
				setConnectedAccounts([])
				setCurrentUserId('user_123') // Fallback for new users
				console.log('📧 No connected accounts found')
			}
		} catch (error) {
			console.error('❌ Error loading connected accounts:', error)
			setCurrentUserId('user_123') // Fallback user ID
		}
	}

	const loadAccountCredentials = async (email: string) => {
		try {
			// Find the user ID for this specific email
			const account = connectedAccounts.find(acc => acc.email === email)
			if (!account) {
				console.error('❌ Account not found in connected accounts')
				return
			}
			
			const response = await fetch(`/api/auth/accounts?userId=${account.userId}&email=${email}`)
			const data = await response.json()
			
			if (data.accessToken) {
				setAccessToken(data.accessToken)
				setSelectedAccount(email)
				setCurrentUserId(account.userId) // Update current user ID
				console.log(`🔑 Loaded credentials for ${email} (userId: ${account.userId})`)
			} else {
				console.error('❌ Failed to load credentials:', data.error)
			}
		} catch (error) {
			console.error('❌ Error loading credentials:', error)
		}
	}

	const handleSelectAccount = (email: string) => {
		if (selectedAccount === email) {
			// Deselect if already selected
			setSelectedAccount(null)
			setAccessToken(null)
			console.log(`🔓 Deselected account: ${email}`)
		} else {
			// Select the account
			loadAccountCredentials(email)
		}
	}

	const handleDisconnectAccount = async (email: string) => {
		// Find the account to get the userId
		const account = connectedAccounts.find(acc => acc.email === email)
		if (!account) {
			console.error('❌ Account not found')
			return
		}

		// Confirm before disconnecting
		const confirmed = window.confirm(
			`Are you sure you want to disconnect ${email}?\n\nThis will remove the account from your connected accounts and you'll need to reconnect it to use it again.`
		)

		if (!confirmed) return

		setDisconnectingAccount(email)
		
		try {
			const response = await fetch('/api/auth/accounts/disconnect', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: account.userId,
					email: email
				})
			})

			const data = await response.json()

			if (response.ok) {
				// If the disconnected account was selected, clear selection
				if (selectedAccount === email) {
					setSelectedAccount(null)
					setAccessToken(null)
				}
				
				// Reload accounts to reflect the change
				await loadConnectedAccounts()
				
				console.log(`🗑️ Successfully disconnected: ${email}`)
				
				// Show success message briefly
				setConnectionSuccess(`Disconnected ${email}`)
				setTimeout(() => setConnectionSuccess(null), 3000)
			} else {
				console.error('❌ Failed to disconnect account:', data.error)
			}
		} catch (error) {
			console.error('❌ Error disconnecting account:', error)
		} finally {
			setDisconnectingAccount(null)
		}
	}

	const handleGoogleAuth = async () => {
		try {
			console.log('🔗 Getting Google OAuth URL...')
			const response = await fetch('/api/auth/url')
			const data = await response.json()
			console.log(`🔗 Auth URL: ${data.authUrl}`)

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
			console.error('❌ No access token available. Please select an account first.')
			return
		}

		setIsLoading(true)
		try {
			console.log('🔍 Fetching emails from Gmail...')
			console.log(`🔍 Fetching ${emailCount} emails from ${selectedAccount}...`)
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
			{/* Connection Success Message */}
			{connectionSuccess && (
				<div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
					<div className="flex justify-between items-center">
						<p className="text-green-800 dark:text-green-200 font-medium">
							✅ {connectionSuccess.includes('Disconnected') ? connectionSuccess : `Successfully connected ${connectionSuccess}!`}
						</p>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setConnectionSuccess(null)}
							className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
						>
							✕
						</Button>
					</div>
				</div>
			)}

			{/* Connected Accounts Section */}
			<div className="mb-8 p-6 bg-card border border-border rounded-lg shadow-sm">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold text-card-foreground">
						Connected Gmail Accounts
					</h2>
					<Button onClick={handleGoogleAuth} variant="outline" className="shadow-sm">
						🔐 Connect Another Account
					</Button>
				</div>
				
				{connectedAccounts.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-muted-foreground mb-4">
							No Gmail accounts connected yet.
						</p>
						<Button onClick={handleGoogleAuth} className="shadow-sm">
							🔐 Connect Your First Gmail Account
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{connectedAccounts.map((account) => (
							<div
								key={account.email}
								className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
									selectedAccount === account.email
										? 'bg-primary/10 border-primary'
										: 'bg-muted/50 border-border hover:bg-muted'
								}`}
							>
								<div className="flex items-center gap-3">
									<div className={`w-3 h-3 rounded-full ${
										account.isExpired ? 'bg-red-500' : 'bg-green-500'
									}`} />
									<div>
										<p className="font-medium text-foreground">{account.email}</p>
										<p className="text-sm text-muted-foreground">
											{account.isExpired ? 'Token expired' : 'Active'}
											{selectedAccount === account.email && ' • Selected'}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button
										onClick={() => handleSelectAccount(account.email)}
										variant={selectedAccount === account.email ? "default" : "outline"}
										size="sm"
										disabled={account.isExpired}
										className="shadow-sm"
									>
										{selectedAccount === account.email ? '✓ Selected' : 'Select'}
									</Button>
									<Button
										onClick={() => handleDisconnectAccount(account.email)}
										variant="outline"
										size="sm"
										disabled={disconnectingAccount === account.email}
										className="shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
									>
										{disconnectingAccount === account.email ? '🔄' : '🗑️ Disconnect'}
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Email Fetching Section */}
			{selectedAccount && accessToken && (
				<div className="mb-8 p-6 bg-card border border-border rounded-lg shadow-sm">
					<h2 className="text-xl font-semibold mb-4 text-card-foreground">
						Fetch Emails from {selectedAccount}
					</h2>
					
					<div className="space-y-4">
						{/* Email Count Input */}
						<div>
							<label htmlFor="emailCount" className="block text-sm font-medium mb-2 text-foreground">
								Number of emails to fetch:
							</label>
							<Input
								id="emailCount"
								type="number"
								min="1"
								max="100"
								value={emailCount}
								onChange={(e) => setEmailCount(parseInt(e.target.value) || 10)}
								className="max-w-xs"
							/>
						</div>

						{/* Search Query Input */}
						<div>
							<label htmlFor="searchQuery" className="block text-sm font-medium mb-2 text-foreground">
								Search query (optional):
							</label>
							<Input
								id="searchQuery"
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="e.g., from:example@gmail.com, subject:important, is:unread"
								className="max-w-lg"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Use Gmail search operators like from:, subject:, is:unread, etc.
							</p>
						</div>

						{/* Fetch Button */}
						<Button
							onClick={handleFetchEmails}
							disabled={isLoading}
							className="shadow-sm"
						>
							{isLoading ? '🔄 Fetching...' : '📧 Fetch Emails & Log to Console'}
						</Button>
					</div>
				</div>
			)}

			{/* Instructions Section */}
			<div className="p-6 bg-card border border-border rounded-lg shadow-sm">
				<h2 className="text-xl font-semibold mb-4 text-card-foreground">
					📋 Instructions
				</h2>
				
				<div className="space-y-4 text-sm text-muted-foreground">
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 1: Connect Gmail Account</h3>
						<p>Click "Connect Gmail Account" to authenticate with Google. Your credentials will be securely saved.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 2: Select Account</h3>
						<p>Choose which connected Gmail account you want to fetch emails from. Click "Select" to choose or "✓ Selected" to deselect.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 3: Fetch Emails</h3>
						<p>Configure your search and fetch emails. Results will be logged to the browser console (F12).</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Disconnect Account</h3>
						<p>Use the "🗑️ Disconnect" button to remove an account. You'll be asked to confirm before the account is removed.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Search Operators</h3>
						<p>You can use Gmail search operators like:</p>
						<ul className="list-disc list-inside mt-2 space-y-1">
							<li><code className="bg-muted px-2 py-1 rounded text-xs">from:example@gmail.com</code> - Emails from specific sender</li>
							<li><code className="bg-muted px-2 py-1 rounded text-xs">subject:important</code> - Emails with specific subject</li>
							<li><code className="bg-muted px-2 py-1 rounded text-xs">is:unread</code> - Unread emails only</li>
							<li><code className="bg-muted px-2 py-1 rounded text-xs">has:attachment</code> - Emails with attachments</li>
						</ul>
					</div>
				</div>
			</div>
		</ContentView>
	)
} 