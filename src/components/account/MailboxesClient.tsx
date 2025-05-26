'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { Mail, Plus, Trash2, RefreshCw, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import type { MailboxWithStatus } from '@/lib/services/mailboxes'

interface MailboxesClientProps {
	initialAccounts: MailboxWithStatus[]
}

export default function MailboxesClient({ initialAccounts }: MailboxesClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { isLoading, isAuthenticated } = useAuth()
	const [accounts, setAccounts] = useState<MailboxWithStatus[]>(initialAccounts)
	const [isConnecting, setIsConnecting] = useState(false)
	const [disconnectingId, setDisconnectingId] = useState<number | null>(null)
	const [syncingId, setSyncingId] = useState<number | null>(null)
	const [isRefreshingTokens, setIsRefreshingTokens] = useState(false)

	// Function to refresh accounts from server
	const refreshAccounts = async () => {
		try {
			const response = await fetch('/api/connected-accounts')
			if (response.ok) {
				const data = await response.json()
				setAccounts(data.accounts || [])
			}
		} catch (error) {
			console.error('Failed to refresh accounts:', error)
		}
	}

	// Function to check and refresh expired tokens
	const checkAndRefreshTokens = async () => {
		try {
			setIsRefreshingTokens(true)
			
			const response = await fetch('/api/connected-accounts/refresh-tokens', {
				method: 'POST',
			})

			if (response.ok) {
				const result = await response.json()
				
				if (result.refreshedCount > 0) {
					console.log(`🔄 Refreshed ${result.refreshedCount} expired tokens`)
					// Refresh accounts to show updated status
					await refreshAccounts()
				}
				
				if (result.errorCount > 0) {
					console.warn(`⚠️ Failed to refresh ${result.errorCount} tokens`)
				}
			}
		} catch (error) {
			console.error('Failed to refresh tokens:', error)
		} finally {
			setIsRefreshingTokens(false)
		}
	}

	// Check and refresh tokens when component loads
	useEffect(() => {
		if (isAuthenticated && accounts.length > 0) {
			// Check if any accounts have expired status
			const hasExpiredAccounts = accounts.some(account => account.status === 'expired')
			
			if (hasExpiredAccounts) {
				console.log('🔍 Found expired accounts, attempting to refresh tokens...')
				checkAndRefreshTokens()
			}
		}
	}, [isAuthenticated, initialAccounts.length]) // Only run when auth status changes or initial load

	// Handle URL parameters for success/error messages
	useEffect(() => {
		const success = searchParams.get('success')
		const error = searchParams.get('error')

		if (success === 'account_connected') {
			toast.success('Mailbox connected successfully!')
			// Refresh accounts to show the new account
			refreshAccounts()
			// Clear the URL parameters to prevent infinite reload
			const url = new URL(window.location.href)
			url.searchParams.delete('success')
			router.replace(url.pathname + url.search)
		} else if (error) {
			const errorMessages: Record<string, string> = {
				'connection_failed': 'Failed to connect mailbox. Please try again.',
				'missing_code': 'Authorization code missing. Please try again.',
				'not_authenticated': 'Please log in to connect mailboxes.',
			}
			toast.error(errorMessages[error] || 'An error occurred. Please try again.')
			// Clear the URL parameters
			const url = new URL(window.location.href)
			url.searchParams.delete('error')
			router.replace(url.pathname + url.search)
		}
	}, [searchParams, router])

	// Redirect if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/auth/login')
		}
	}, [isLoading, isAuthenticated, router])

	const handleConnectAccount = async () => {
		try {
			setIsConnecting(true)
			
			// Call API to get OAuth URL
			const response = await fetch('/api/connected-accounts', {
				method: 'POST',
			})

			if (!response.ok) {
				throw new Error('Failed to initiate OAuth flow')
			}

			const { authUrl } = await response.json()
			
			// Redirect to Google OAuth
			window.location.href = authUrl
		} catch (error) {
			console.error('Connect account error:', error)
			toast.error('Failed to connect mailbox. Please try again.')
			setIsConnecting(false)
		}
	}

	const handleDisconnectAccount = async (accountId: number, email: string) => {
		try {
			setDisconnectingId(accountId)
			
			const response = await fetch(`/api/connected-accounts/${accountId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to disconnect account')
			}
			
			setAccounts(prev => prev.filter(account => account.id !== accountId))
			toast.success(`${email} disconnected successfully`)
		} catch (error) {
			console.error('Disconnect error:', error)
			toast.error('Failed to disconnect mailbox. Please try again.')
		} finally {
			setDisconnectingId(null)
		}
	}

	const handleSyncAccount = async (accountId: number, email: string) => {
		try {
			setSyncingId(accountId)
			
			const response = await fetch(`/api/connected-accounts/${accountId}/sync`, {
				method: 'POST',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to sync account')
			}

			const result = await response.json()
			
			setAccounts(prev => prev.map(account => 
				account.id === accountId 
					? { ...account, lastSync: 'Just now', status: 'active' as const }
					: account
			))
			toast.success(`${email} synced successfully`)
		} catch (error) {
			console.error('Sync error:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to sync mailbox. Please try again.')
		} finally {
			setSyncingId(null)
		}
	}

	const getStatusIcon = (status: MailboxWithStatus['status']) => {
		switch (status) {
			case 'active':
				return <CheckCircle className="h-4 w-4 text-green-500" />
			case 'error':
				return <AlertCircle className="h-4 w-4 text-red-500" />
			case 'expired':
				return <AlertCircle className="h-4 w-4 text-yellow-500" />
			default:
				return null
		}
	}

	const getStatusText = (status: MailboxWithStatus['status']) => {
		switch (status) {
			case 'active':
				return 'Active'
			case 'error':
				return 'Error'
			case 'expired':
				return 'Expired'
			default:
				return 'Unknown'
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return null // Will redirect in useEffect
	}

	return (
		<div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-4 mb-2">
							<Link href="/account/settings">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Settings
								</Button>
							</Link>
						</div>
						<h1 className="text-3xl font-bold text-foreground">Mailboxes</h1>
						<p className="text-muted-foreground mt-2">
							Manage your connected email mailboxes and view their status
						</p>
						{isRefreshingTokens && (
							<div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
								<RefreshCw className="h-4 w-4 animate-spin" />
								Refreshing expired tokens...
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						{accounts.length > 0 && (
							<Button 
								variant="outline"
								onClick={checkAndRefreshTokens}
								disabled={isRefreshingTokens || isConnecting}
								className="flex items-center gap-2"
							>
								{isRefreshingTokens ? (
									<RefreshCw className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4" />
								)}
								Refresh Tokens
							</Button>
						)}
						<Button 
							onClick={handleConnectAccount}
							disabled={isConnecting}
							className="flex items-center gap-2"
						>
							{isConnecting ? (
								<RefreshCw className="h-4 w-4 animate-spin" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							{isConnecting ? 'Connecting...' : 'Connect Mailbox'}
						</Button>
					</div>
				</div>

				{/* Connected Accounts List */}
				<div className="space-y-4">
					{accounts.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Mail className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No Connected Mailboxes</h3>
								<p className="text-muted-foreground text-center mb-6">
									Connect your email mailboxes to start receiving daily summaries
								</p>
								<Button onClick={handleConnectAccount} disabled={isConnecting}>
									{isConnecting ? (
										<RefreshCw className="h-4 w-4 animate-spin mr-2" />
									) : (
										<Plus className="h-4 w-4 mr-2" />
									)}
									{isConnecting ? 'Connecting...' : 'Connect Your First Mailbox'}
								</Button>
							</CardContent>
						</Card>
					) : (
						accounts.map((account) => (
							<Card key={account.id}>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
												<Mail className="h-5 w-5 text-primary" />
											</div>
											<div>
												<CardTitle className="text-lg">{account.email}</CardTitle>
												<CardDescription className="flex items-center gap-2">
													{getStatusIcon(account.status)}
													{getStatusText(account.status)} • {account.provider}
												</CardDescription>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleSyncAccount(account.id, account.email)}
												disabled={disconnectingId === account.id || syncingId === account.id}
											>
												{syncingId === account.id ? (
													<RefreshCw className="h-4 w-4 animate-spin mr-2" />
												) : (
													<RefreshCw className="h-4 w-4 mr-2" />
												)}
												Sync
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDisconnectAccount(account.id, account.email)}
												disabled={disconnectingId === account.id || syncingId === account.id}
												className="text-destructive hover:text-destructive"
											>
												{disconnectingId === account.id ? (
													<RefreshCw className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-muted-foreground">Last Sync</p>
											<p className="font-medium">{account.lastSync || 'Never'}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Emails Processed</p>
											<p className="font-medium">{account.emailCount || 0}</p>
										</div>
									</div>
									{account.status === 'expired' && (
										<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
											<p className="text-sm text-yellow-800">
												This mailbox's authorization has expired. Please reconnect to continue receiving summaries.
											</p>
										</div>
									)}
									{account.status === 'error' && (
										<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
											<p className="text-sm text-red-800">
												There was an error accessing this mailbox. Please try syncing or reconnecting.
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						))
					)}
				</div>

				{/* Help Section */}
				<Card>
					<CardHeader>
						<CardTitle>Need Help?</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 text-sm text-muted-foreground">
							<p>• Connected mailboxes allow Sumails to access and summarize your emails</p>
							<p>• We only read email metadata and content for summarization purposes</p>
							<p>• You can disconnect mailboxes at any time</p>
							<p>• Sync manually to get the latest email summaries</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 