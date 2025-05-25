'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/dialogs'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectedAccount {
	email: string
	userId: string
	isExpired: boolean
}

export default function ConnectedEmailsPage() {
	const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
	const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
	const [disconnectingAccount, setDisconnectingAccount] = useState<string | null>(null)
	const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
	const [accountToDisconnect, setAccountToDisconnect] = useState<ConnectedAccount | null>(null)
	
	const searchParams = useSearchParams()

	useEffect(() => {
		// Check if we just connected an account
		const connected = searchParams.get('connected')
		const connectedEmail = searchParams.get('email')
		const initialSummaryAttempted = searchParams.get('initial_summary_attempted')
		
		if (connected === 'success' && connectedEmail) {
			const summaryMessage = initialSummaryAttempted === 'true' 
				? 'Account connected and initial email summary attempted!'
				: 'Account connected successfully!'
			
			toast.success(`${summaryMessage}`, {
				description: `${connectedEmail} is now connected. Check the Today's Summary page for email insights.`,
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
				console.log(`📧 Loaded ${data.accounts.length} connected accounts`)
			} else {
				// No accounts found
				setConnectedAccounts([])
				console.log('📧 No connected accounts found')
			}
		} catch (error) {
			console.error('❌ Error loading connected accounts:', error)
			toast.error('Failed to load connected accounts', {
				description: 'Please try refreshing the page.',
			})
		} finally {
			setIsLoadingAccounts(false)
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
								className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 border-border hover:bg-muted"
							>
								<div className="flex items-center gap-3">
									<div className={`w-3 h-3 rounded-full ${
										account.isExpired ? 'bg-red-500' : 'bg-green-500'
									}`} />
									<div>
										<p className="font-medium text-foreground">{account.email}</p>
										<p className="text-sm text-muted-foreground">
											{account.isExpired ? 'Token expired - please reconnect' : 'Active'}
										</p>
									</div>
								</div>
								<Button
									onClick={() => handleDisconnectClick(account.email)}
									variant="outline"
									size="sm"
									disabled={disconnectingAccount === account.email}
									className="shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
								>
									{disconnectingAccount === account.email ? '🔄' : <Trash2 className="w-4 h-4 mr-2" />}
									{disconnectingAccount === account.email ? 'Disconnecting...' : 'Disconnect'}
								</Button>
							</div>
						))}
					</div>
				)}
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