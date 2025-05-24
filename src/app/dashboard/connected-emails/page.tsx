'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationDialog } from '@/components/dialogs'
import { Trash2 } from 'lucide-react'
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
	const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
	const [isAISummarizing, setIsAISummarizing] = useState(false)
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

	const handleEnhancedAISummarization = async () => {
		if (!accessToken || !selectedAccount || !currentUserId) {
			toast.error('No account selected', {
				description: 'Please select an account first.',
			})
			return
		}

		setIsAISummarizing(true)
		try {
			console.log('🚀 Starting enhanced email summarization with full content...')
			
			const response = await fetch('/api/emails/summarize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					accessToken,
					accountEmail: selectedAccount,
					userId: currentUserId,
				}),
			})

			const data = await response.json()
			
			if (data.success) {
				console.log('✅ Enhanced email summarization successful!')
				console.log(`📊 Emails fetched: ${data.emailsFetched}`)
				console.log(`📧 Emails summarized: ${data.emailsSummarized}`)
				console.log(`📊 Digest ID: ${data.digestId}`)
				
				// Log content statistics if available
				if (data.contentStats) {
					console.log(`📊 Content quality:`, data.contentStats)
				}
				
				if (data.alreadyProcessed) {
					toast.info('Account already processed today!', {
						description: `${selectedAccount} was processed earlier today. Check email_digests.json for results.`,
					})
				} else {
					const contentInfo = data.contentStats 
						? `${data.contentStats.withTextContent} with full text, ${data.contentStats.withHtmlContent} with HTML`
						: 'with enhanced content'
					
					toast.success('Enhanced email summarization complete!', {
						description: `Analyzed ALL ${data.emailsFetched} emails from today (${contentInfo}). Check email_digests.json for AI insights.`,
					})
				}
			} else {
				console.error('❌ Enhanced email summarization failed:', data.error)
				toast.error('Enhanced email summarization failed', {
					description: data.error || 'Please try again.',
				})
			}
		} catch (error) {
			console.error('❌ Error in enhanced email summarization:', error)
			toast.error('Error in enhanced email summarization', {
				description: 'Please check your connection and try again.',
			})
		} finally {
			setIsAISummarizing(false)
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
					// Skeleton Loading
					<div className="space-y-3">
						{[1, 2, 3].map((index) => (
							<div
								key={index}
								className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 animate-pulse"
							>
								<div className="flex items-center gap-3">
									<div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
									<div>
										<div className="h-4 bg-muted-foreground/30 rounded w-48 mb-2" />
										<div className="h-3 bg-muted-foreground/20 rounded w-24" />
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-8 bg-muted-foreground/30 rounded w-16" />
									<div className="h-8 bg-muted-foreground/30 rounded w-20" />
								</div>
							</div>
						))}
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

			{/* Enhanced AI Summarization Section */}
			{selectedAccount && accessToken && (
				<div className="mb-8 p-6 bg-card border border-border rounded-lg shadow-sm">
					<h2 className="text-xl font-semibold mb-4 text-card-foreground">
						📧 Enhanced AI Email Analysis for {selectedAccount}
					</h2>
					
					<div className="space-y-4">
						<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
							<h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
								🚀 What This Does
							</h3>
							<ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
								<li>• Fetches <strong>ALL today's emails</strong> with full content (not just snippets)</li>
								<li>• Uses advanced AI to analyze themes, patterns, and priorities</li>
								<li>• Identifies important emails and actionable items</li>
								<li>• Provides personalized inbox management suggestions</li>
								<li>• Saves results to email_digests.json for review</li>
							</ul>
						</div>

						{/* Enhanced AI Summarization Button */}
						<Button
							onClick={handleEnhancedAISummarization}
							disabled={isAISummarizing}
							size="lg"
							className="shadow-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
						>
							{isAISummarizing ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									🤖 Analyzing emails with AI...
								</>
							) : (
								'🤖 Analyze Today\'s Emails with AI'
							)}
						</Button>
					</div>
				</div>
			)}

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