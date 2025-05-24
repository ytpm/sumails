'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationDialog } from '@/components/dialogs'
import { Trash2, BarChart } from 'lucide-react'
import { toast } from 'sonner'
import type { GmailMessage } from '@/types/email'

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
	const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
	const [isAISummarizing, setIsAISummarizing] = useState(false)
	const [isLoadingLog, setIsLoadingLog] = useState(false)
	const [emailCount, setEmailCount] = useState(10)
	const [searchQuery, setSearchQuery] = useState('')
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)
	const [disconnectingAccount, setDisconnectingAccount] = useState<string | null>(null)
	const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
	const [accountToDisconnect, setAccountToDisconnect] = useState<ConnectedAccount | null>(null)
	const searchParams = useSearchParams()

	useEffect(() => {
		// Check if we just connected an account
		const connected = searchParams.get('connected')
		const connectedEmail = searchParams.get('email')
		
		if (connected === 'success' && connectedEmail) {
			toast.success(`Successfully connected ${connectedEmail}!`, {
				description: 'You can now select this account to fetch emails.',
			})
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
		setIsLoadingAccounts(true)
		try {
			console.log('🔄 Loading connected accounts and checking tokens...')
			
			// Load all accounts regardless of user ID (for development)
			const response = await fetch('/api/auth/accounts/all')
			const data = await response.json()
			
			if (data.accounts && data.accounts.length > 0) {
				// Count active vs expired accounts
				const activeAccounts = data.accounts.filter((acc: any) => !acc.isExpired).length
				const totalAccounts = data.accounts.length
				
				setConnectedAccounts(data.accounts)
				// Set user ID to the first one found (for credential loading)
				setCurrentUserId(data.accounts[0].userId)
				console.log(`📧 Loaded ${totalAccounts} connected accounts (${activeAccounts} active)`)
				
				// Show success message if tokens were refreshed
				if (activeAccounts === totalAccounts && totalAccounts > 0) {
					toast.success(`Loaded ${totalAccounts} connected accounts`, {
						description: 'All account tokens are active and ready to use.',
					})
				} else if (activeAccounts > 0) {
					toast.success(`Loaded ${totalAccounts} accounts`, {
						description: `${activeAccounts} active accounts, ${totalAccounts - activeAccounts} with expired tokens.`,
					})
				}
			} else {
				// No accounts found
				setConnectedAccounts([])
				setCurrentUserId('user_123') // Fallback for new users
				console.log('📧 No connected accounts found')
			}
		} catch (error) {
			console.error('❌ Error loading connected accounts:', error)
			toast.error('Failed to load connected accounts', {
				description: 'Please try refreshing the page.',
			})
			setCurrentUserId('user_123') // Fallback user ID
		} finally {
			setIsLoadingAccounts(false)
		}
	}

	const loadAccountCredentials = async (email: string) => {
		try {
			// Find the user ID for this specific email
			const account = connectedAccounts.find(acc => acc.email === email)
			if (!account) {
				console.error('❌ Account not found in connected accounts')
				toast.error('Account not found')
				return
			}
			
			const response = await fetch(`/api/auth/accounts?userId=${account.userId}&email=${email}`)
			const data = await response.json()
			
			if (data.accessToken) {
				setAccessToken(data.accessToken)
				setSelectedAccount(email)
				setCurrentUserId(account.userId) // Update current user ID
				toast.success(`Selected ${email}`, {
					description: 'You can now fetch emails from this account.',
				})
				console.log(`🔑 Loaded credentials for ${email} (userId: ${account.userId})`)
			} else {
				console.error('❌ Failed to load credentials:', data.error)
				toast.error('Failed to load account credentials')
			}
		} catch (error) {
			console.error('❌ Error loading credentials:', error)
			toast.error('Error loading account credentials')
		}
	}

	const handleSelectAccount = (email: string) => {
		if (selectedAccount === email) {
			// Deselect if already selected
			setSelectedAccount(null)
			setAccessToken(null)
			toast.info(`Deselected ${email}`)
			console.log(`🔓 Deselected account: ${email}`)
		} else {
			// Select the account
			loadAccountCredentials(email)
		}
	}

	const handleDisconnectClick = (email: string) => {
		// Find the account to get the userId
		const account = connectedAccounts.find(acc => acc.email === email)
		if (!account) {
			console.error('❌ Account not found')
			toast.error('Account not found')
			return
		}

		setAccountToDisconnect(account)
		setShowDisconnectDialog(true)
	}

	const handleDisconnectConfirm = async () => {
		if (!accountToDisconnect) return

		setDisconnectingAccount(accountToDisconnect.email)
		
		try {
			const response = await fetch('/api/auth/accounts/disconnect', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: accountToDisconnect.userId,
					email: accountToDisconnect.email
				})
			})

			const data = await response.json()

			if (response.ok) {
				// If the disconnected account was selected, clear selection
				if (selectedAccount === accountToDisconnect.email) {
					setSelectedAccount(null)
					setAccessToken(null)
				}
				
				// Reload accounts to reflect the change
				await loadConnectedAccounts()
				
				console.log(`🗑️ Successfully disconnected: ${accountToDisconnect.email}`)
				
				// Show success toast
				toast.success(`Disconnected ${accountToDisconnect.email}`, {
					description: 'The account has been removed from your connected accounts.',
				})
				
				// Close dialog
				setShowDisconnectDialog(false)
			} else {
				console.error('❌ Failed to disconnect account:', data.error)
				toast.error('Failed to disconnect account', {
					description: data.error || 'Please try again.',
				})
			}
		} catch (error) {
			console.error('❌ Error disconnecting account:', error)
			toast.error('Error disconnecting account', {
				description: 'Please check your connection and try again.',
			})
		} finally {
			setDisconnectingAccount(null)
			setAccountToDisconnect(null)
		}
	}

	const handleDisconnectCancel = () => {
		setShowDisconnectDialog(false)
		setAccountToDisconnect(null)
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
				toast.error('Failed to get authentication URL')
			}
		} catch (error) {
			console.error('❌ Error getting auth URL:', error)
			toast.error('Error starting authentication')
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
		
		// Show success toast
		toast.success(`Fetched ${emails.length} emails`, {
			description: 'Check the browser console for detailed email information.',
		})
	}

	const handleFetchEmails = async () => {
		if (!accessToken) {
			console.error('❌ No access token available. Please select an account first.')
			toast.error('No account selected', {
				description: 'Please select an account first.',
			})
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
				toast.error('Failed to fetch emails', {
					description: data.error || 'Please try again.',
				})
			}
		} catch (error) {
			console.error('❌ Error fetching emails:', error)
			toast.error('Error fetching emails', {
				description: 'Please check your connection and try again.',
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleAISummarization = async () => {
		if (!accessToken || !selectedAccount || !currentUserId) {
			toast.error('No account selected', {
				description: 'Please select an account first.',
			})
			return
		}

		setIsAISummarizing(true)
		try {
			console.log('🚀 Starting complete email summarization...')
			
			const response = await fetch('/api/emails/summarize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					accessToken,
					accountEmail: selectedAccount,
					userId: currentUserId,
					maxResults: emailCount,
					query: searchQuery,
				}),
			})

			const data = await response.json()
			
			if (data.success) {
				console.log('✅ Complete email summarization successful!')
				console.log(`📊 Emails fetched: ${data.emailsFetched}`)
				console.log(`📧 Emails summarized: ${data.emailsSummarized}`)
				console.log(`📊 Digest ID: ${data.digestId}`)
				
				if (data.alreadyProcessed) {
					toast.info('Account already processed today!', {
						description: `${selectedAccount} was processed earlier today. Check email_digests.json for results.`,
					})
				} else {
					toast.success('Complete email summarization finished!', {
						description: `Fetched ${data.emailsFetched} emails, summarized ${data.emailsSummarized}. Check email_digests.json for results.`,
					})
				}
			} else {
				console.error('❌ Complete email summarization failed:', data.error)
				toast.error('Complete email summarization failed', {
					description: data.error || 'Please try again.',
				})
			}
		} catch (error) {
			console.error('❌ Error in complete email summarization:', error)
			toast.error('Error in complete email summarization', {
				description: 'Please check your connection and try again.',
			})
		} finally {
			setIsAISummarizing(false)
		}
	}

	const handleViewProcessingLog = async () => {
		setIsLoadingLog(true)
		try {
			console.log('📊 Loading account processing log...')
			
			const response = await fetch('/api/processing-log')
			const data = await response.json()
			
			if (data.success) {
				console.log('✅ Processing log loaded successfully!')
				console.log(`📊 Total entries: ${data.total}`)
				
				console.log('\n📋 Account Processing Log:\n')
				data.logs.forEach((log: any, index: number) => {
					console.log(`--- Entry ${index + 1} ---`)
					console.log(`📧 Account: ${log.account_email}`)
					console.log(`👤 User ID: ${log.user_id}`)
					console.log(`📅 Date: ${log.date}`)
					console.log(`⏰ Processed: ${new Date(log.last_processed_at).toLocaleString()}`)
					console.log(`📧 Emails Fetched: ${log.emails_fetched}`)
					console.log(`🤖 Emails Summarized: ${log.emails_summarized}`)
					console.log(`📊 Digest ID: ${log.digest_id || 'N/A'}`)
					console.log(`✅ Status: ${log.status}`)
					console.log('-------------------\n')
				})
				
				toast.success('Processing log loaded!', {
					description: `Found ${data.total} processing entries. Check browser console for details.`,
				})
			} else {
				console.error('❌ Failed to load processing log:', data.error)
				toast.error('Failed to load processing log', {
					description: data.error || 'Please try again.',
				})
			}
		} catch (error) {
			console.error('❌ Error loading processing log:', error)
			toast.error('Error loading processing log', {
				description: 'Please check your connection and try again.',
			})
		} finally {
			setIsLoadingLog(false)
		}
	}

	return (
		<ContentView>
			{/* Connected Accounts Section */}
			<div className="mb-8 p-6 bg-card border border-border rounded-lg shadow-sm">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold text-card-foreground">
						Connected Gmail Accounts
					</h2>
					{connectedAccounts.length > 0 && !isLoadingAccounts && (
						<Button onClick={handleGoogleAuth} variant="outline" className="shadow-sm">
							🔐 Connect Another Account
						</Button>
					)}
				</div>
				
				{isLoadingAccounts ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">
							Loading accounts and refreshing tokens...
						</p>
					</div>
				) : connectedAccounts.length === 0 ? (
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
										onClick={() => handleDisconnectClick(account.email)}
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

						{/* AI Summarization Button */}
						<Button
							onClick={handleAISummarization}
							disabled={isAISummarizing}
							variant="default"
							className="shadow-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
						>
							{isAISummarizing ? '🚀 Processing...' : '🚀 Summarize Emails with AI'}
						</Button>

						{/* View Processing Log Button */}
						<Button
							onClick={handleViewProcessingLog}
							disabled={isLoadingLog}
							variant="outline"
							className="shadow-sm"
						>
							<BarChart className="w-4 h-4 mr-2" />
							{isLoadingLog ? '📊 Loading...' : '📊 View Processing Log'}
						</Button>

						<div className="text-xs text-muted-foreground mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
							<p className="font-medium mb-1 text-blue-900 dark:text-blue-100">🚀 AI Email Summarization</p>
							<p className="text-blue-800 dark:text-blue-200">This will automatically:</p>
							<ul className="list-disc list-inside mt-1 space-y-1 text-blue-700 dark:text-blue-300">
								<li>✅ Check if account was already processed today</li>
								<li>📧 Fetch latest emails from Gmail API</li>
								<li>🔍 Filter out already summarized messages</li>
								<li>🤖 Send to OpenAI GPT-4o for intelligent analysis</li>
								<li>💾 Save results and update tracking files</li>
							</ul>
							<p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">⚡ Perfect for daily email summaries!</p>
							<p className="mt-1 text-xs text-blue-500 dark:text-blue-500">Daily processing prevention: Won't re-process the same account twice in one day</p>
						</div>
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
						<p>Click "Connect Gmail Account" to authenticate with Google. Your credentials will be securely saved and automatically refreshed when needed.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 2: Select Account</h3>
						<p>Choose which connected Gmail account you want to fetch emails from. Click "Select" to choose or "✓ Selected" to deselect.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">🔄 Automatic Token Refresh</h3>
						<p>Expired account tokens are automatically refreshed when you load the dashboard. You should see all accounts as "Active" - if any show as "Token expired", try refreshing the page.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">Step 3: Summarize Emails</h3>
						<p>Use "🚀 Summarize Emails with AI" to automatically fetch, filter, and summarize emails. Use "📧 Fetch Emails & Log to Console" for testing/debugging only.</p>
					</div>
					
					<div>
						<h3 className="font-medium text-foreground mb-2">AI Summarization</h3>
						<p>The AI summarization performs the complete workflow: fetch from Gmail, filter already processed emails, send to OpenAI GPT-4o, and save results to JSON files.</p>
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

			{/* Confirmation Dialog */}
			<ConfirmationDialog
				open={showDisconnectDialog}
				onOpenChange={setShowDisconnectDialog}
				title="Disconnect Account"
				description={`Are you sure you want to disconnect ${accountToDisconnect?.email}? This will remove the account from your connected accounts and you'll need to reconnect it to use it again.`}
				confirmText="Disconnect"
				cancelText="Cancel"
				confirmVariant="destructive"
				onConfirm={handleDisconnectConfirm}
				onCancel={handleDisconnectCancel}
				isLoading={disconnectingAccount === accountToDisconnect?.email}
				icon={<Trash2 className="w-5 h-5 text-red-600" />}
			/>
		</ContentView>
	)
} 