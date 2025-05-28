'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { Mail, Plus, Trash2, RefreshCw, ArrowLeft, CheckCircle, AlertCircle, Clock, Zap, Eye, Calendar, FileText } from 'lucide-react'
import type { MailboxWithStatus } from '@/lib/services/mailboxes'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InboxStatus } from '@/types/email'
import MailboxesLoadingSkeleton from './mailboxes/MailboxesLoadingSkeleton'
import SummariesDialog from './mailboxes/SummariesDialog'

interface MailboxesClientProps {
	initialAccounts: MailboxWithStatus[]
}

interface SummaryStatus {
	accountId: string
	accountEmail: string
	lastSummaryDate?: string
	lastSummaryStatus?: InboxStatus
	hasRecentSummary: boolean
}

function MailboxesClientInner({ initialAccounts }: MailboxesClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { isLoading, isAuthenticated } = useAuth()
	const [accounts, setAccounts] = useState<MailboxWithStatus[]>(initialAccounts)
	const [summaryStatuses, setSummaryStatuses] = useState<SummaryStatus[]>([])
	const [isConnecting, setIsConnecting] = useState(false)
	const [disconnectingId, setDisconnectingId] = useState<string | null>(null)
	const [syncingId, setSyncingId] = useState<string | null>(null)
	const [isRefreshingTokens, setIsRefreshingTokens] = useState(false)
	const [isLoadingSummaries, setIsLoadingSummaries] = useState(true)
	const [generatingForAccount, setGeneratingForAccount] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [summariesDialogOpen, setSummariesDialogOpen] = useState(false)
	const [selectedAccountForSummaries, setSelectedAccountForSummaries] = useState<MailboxWithStatus | null>(null)

	// Function to refresh accounts from server
	const refreshAccounts = async () => {
		try {
			const response = await fetch('/api/mailboxes')
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
			
			const response = await fetch('/api/mailboxes/refresh-tokens', {
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

	// Load summary statuses on component mount
	useEffect(() => {
		loadSummaryStatuses()
	}, [])

	const loadSummaryStatuses = async () => {
		try {
			setIsLoadingSummaries(true)
			const response = await fetch('/api/summaries')
			
			if (!response.ok) {
				throw new Error('Failed to load summary statuses')
			}

			const data = await response.json()
			setSummaryStatuses(data.accounts || [])
		} catch (error) {
			console.error('Error loading summary statuses:', error)
			setError('Failed to load summary statuses')
		} finally {
			setIsLoadingSummaries(false)
		}
	}

	const handleConnectAccount = async () => {
		setIsConnecting(true)
		setError(null)
		
		try {
						// Call API to get OAuth URL
						const response = await fetch('/api/mailboxes', {
							method: 'POST',
						})
			
						if (!response.ok) {
							throw new Error('Failed to initiate OAuth flow')
						}
			
						const { authUrl } = await response.json()
			// // Redirect to Google OAuth
			// const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
			// const redirectUri = process.env.NODE_ENV === 'production' 
			// 	? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
			// 	: 'http://localhost:3000/api/auth/callback'
			
			// const scope = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email'
			// const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`
			
			window.location.href = authUrl
		} catch (error) {
			console.error('Error connecting account:', error)
			setError('Failed to connect account')
			setIsConnecting(false)
		}
	}

	const handleDisconnectAccount = async (accountId: string) => {
		try {
			setDisconnectingId(accountId)
			
			const response = await fetch(`/api/mailboxes/${accountId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to disconnect account')
			}
			
			setAccounts(prev => prev.filter(account => account.id !== accountId))
			toast.success(`${accounts.find(a => a.id === accountId)?.email} disconnected successfully`)
		} catch (error) {
			console.error('Disconnect error:', error)
			toast.error('Failed to disconnect mailbox. Please try again.')
		} finally {
			setDisconnectingId(null)
		}
	}

	const handleSyncAccount = async (accountId: string, email: string) => {
		try {
			setSyncingId(accountId)
			
			const response = await fetch(`/api/mailboxes/${accountId}/sync`, {
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

	const handleGenerateSummary = async (accountId: string) => {
		setGeneratingForAccount(accountId)
		setError(null)
		setSuccess(null)

		try {
			const response = await fetch(`/api/summaries/${accountId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					dateRange: 'today',
					forceRegenerate: false
				})
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate summary')
			}

			if (data.alreadyExists) {
				setSuccess('Summary already exists for today')
			} else {
				setSuccess(`Summary generated successfully! Status: ${data.inboxStatus}`)
			}

			// Reload summary statuses to show updated data
			await loadSummaryStatuses()

		} catch (error) {
			console.error('Error generating summary:', error)
			setError(error instanceof Error ? error.message : 'Failed to generate summary')
		} finally {
			setGeneratingForAccount(null)
		}
	}

	const handleOpenSummaries = (account: MailboxWithStatus) => {
		setSelectedAccountForSummaries(account)
		setSummariesDialogOpen(true)
	}

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			'active': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
			'expired': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
			'error': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
			'attention_needed': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
			'worth_a_look': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Eye },
			'all_clear': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
		}
		
		return statusConfig[status as keyof typeof statusConfig] || { 
			color: 'bg-gray-100 text-gray-800 border-gray-200', 
			icon: Clock 
		}
	}

	const getSummaryStatusForAccount = (accountId: string): SummaryStatus | undefined => {
		return summaryStatuses.find(status => status.accountId === accountId)
	}

	const formatLastSummaryDate = (dateString?: string): string => {
		if (!dateString) return 'Never'
		
		const date = new Date(dateString)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)
		
		if (date.toDateString() === today.toDateString()) {
			return 'Today'
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday'
		} else {
			return date.toLocaleDateString()
		}
	}

	if (isLoading) {
		return <MailboxesLoadingSkeleton />
	}

	if (!isAuthenticated) {
		return null // Will redirect in useEffect
	}

	return (
		<div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
				{/* Header */}
				<div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
					<div className="space-y-3 sm:space-y-2">
						<div className="flex items-center gap-4">
							<Link href="/account/settings">
								<Button variant="ghost" size="sm" className="h-8 sm:h-9">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Settings
								</Button>
							</Link>
						</div>
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mailboxes</h1>
							<p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
								Manage your connected email mailboxes and view their status
							</p>
						</div>
						{isRefreshingTokens && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<RefreshCw className="h-4 w-4 animate-spin" />
								<span className="text-xs sm:text-sm">Refreshing expired tokens...</span>
							</div>
						)}
					</div>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
						{accounts.length > 0 && (
							<Button 
								variant="outline"
								onClick={checkAndRefreshTokens}
								disabled={isRefreshingTokens || isConnecting}
								className="flex items-center justify-center gap-2 h-10 sm:h-9 text-sm"
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
							className="flex items-center justify-center gap-2 h-10 sm:h-9 text-sm"
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

				{/* Alerts */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="text-sm">{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert>
						<CheckCircle className="h-4 w-4" />
						<AlertDescription className="text-sm">{success}</AlertDescription>
					</Alert>
				)}

				{/* Loading State */}
				{isLoadingSummaries && (
					<Card>
						<CardContent className="flex items-center justify-center py-6 sm:py-8">
							<div className="flex items-center gap-2">
								<RefreshCw className="h-4 w-4 animate-spin" />
								<span className="text-sm">Loading summary statuses...</span>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Connected Accounts List */}
				<div className="space-y-4">
					{accounts.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
								<Mail className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
								<h3 className="text-lg font-semibold mb-2 text-center">No Connected Mailboxes</h3>
								<p className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6 max-w-md">
									Connect your email mailboxes to start receiving daily summaries
								</p>
								<Button 
									onClick={handleConnectAccount} 
									disabled={isConnecting}
									className="w-full sm:w-auto"
								>
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
						accounts.map((account) => {
							const summaryStatus = getSummaryStatusForAccount(account.id)
							const accountStatusBadge = getStatusBadge(account.status)
							const summaryStatusBadge = summaryStatus?.lastSummaryStatus 
								? getStatusBadge(summaryStatus.lastSummaryStatus)
								: null

							return (
								<Card key={account.id}>
									<CardHeader className="pb-3 sm:pb-6">
										<div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
											<div className="flex items-center gap-3">
												<div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
													<Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
												</div>
												<div className="min-w-0 flex-1">
													<CardTitle className="text-base sm:text-lg truncate">{account.email}</CardTitle>
													<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0">
														<Badge 
															variant="outline" 
															className={`${accountStatusBadge.color} text-xs`}
														>
															<accountStatusBadge.icon className="h-3 w-3 mr-1" />
															{account.status.charAt(0).toUpperCase() + account.status.slice(1)}
														</Badge>
														{summaryStatusBadge && (
															<Badge 
																variant="outline" 
																className={`${summaryStatusBadge.color} text-xs`}
															>
																<summaryStatusBadge.icon className="h-3 w-3 mr-1" />
																{summaryStatus?.lastSummaryStatus?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
															</Badge>
														)}
													</div>
												</div>
											</div>
											<div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleOpenSummaries(account)}
													className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
												>
													<FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
													Summaries
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleSyncAccount(account.id, account.email)}
													disabled={disconnectingId === account.id || syncingId === account.id}
													className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
												>
													{syncingId === account.id ? (
														<RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
													) : (
														<RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
													)}
													Sync
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDisconnectAccount(account.id)}
													disabled={disconnectingId === account.id || syncingId === account.id}
													className="text-destructive hover:text-destructive h-8 sm:h-9 px-2 sm:px-3"
												>
													{disconnectingId === account.id ? (
														<RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
													) : (
														<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
													)}
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex items-center justify-between text-xs sm:text-sm gap-2">
											<div className="flex items-center gap-1 text-muted-foreground">
												<Calendar className="h-3 w-3" />
												<span>Last sync:</span>
												<span className="font-medium text-foreground">{account.lastSync || 'Never'}</span>
											</div>
											<div className="flex items-center gap-1 text-muted-foreground">
												<Mail className="h-3 w-3" />
												<span>Emails:</span>
												<span className="font-medium text-foreground">{account.emailCount || 0}</span>
											</div>
										</div>
										{account.status === 'expired' && (
											<div className="mt-3 sm:mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
												<p className="text-xs sm:text-sm text-yellow-800">
													This mailbox's authorization has expired. Please reconnect to continue receiving summaries.
												</p>
											</div>
										)}
										{account.status === 'error' && (
											<div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
												<p className="text-xs sm:text-sm text-red-800">
													There was an error accessing this mailbox. Please try syncing or reconnecting.
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							)
						})
					)}
				</div>

				{/* Help Section */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg sm:text-xl">📬 Summary System</CardTitle>
						<CardDescription className="text-sm sm:text-base">
							How the Sumails summary system works
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
								<div className="p-3 bg-blue-50 rounded-lg border">
									<div className="font-medium text-blue-900 mb-2 text-sm">🔌 Automatic Summaries</div>
									<div className="text-blue-700 text-xs sm:text-sm">
										Summaries are generated automatically when you connect a mailbox and daily via CRON jobs.
									</div>
								</div>
								<div className="p-3 bg-green-50 rounded-lg border">
									<div className="font-medium text-green-900 mb-2 text-sm">🤖 AI-Powered</div>
									<div className="text-green-700 text-xs sm:text-sm">
										Our AI analyzes your emails and provides intelligent insights and highlights.
									</div>
								</div>
								<div className="p-3 bg-purple-50 rounded-lg border sm:col-span-2 lg:col-span-1">
									<div className="font-medium text-purple-900 mb-2 text-sm">📱 Smart Notifications</div>
									<div className="text-purple-700 text-xs sm:text-sm">
										Get notified only when there's something important in your inbox.
									</div>
								</div>
							</div>
							
							<Separator />
							
							<div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
								<p>• <strong>Attention Needed:</strong> Contains urgent or important emails requiring action</p>
								<p>• <strong>Worth a Look:</strong> Moderate relevance, some things to review</p>
								<p>• <strong>All Clear:</strong> Nothing critical today, you're caught up!</p>
								<p>• Summaries are generated once per day to avoid duplicates</p>
								<p>• Use "Generate Summary" to create today's summary or "Regenerate" to force a new one</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<SummariesDialog
				open={summariesDialogOpen}
				onClose={() => setSummariesDialogOpen(false)}
				account={selectedAccountForSummaries}
			/>
		</div>
	)
}

export default function MailboxesClient({ initialAccounts }: MailboxesClientProps) {
	return (
		<Suspense fallback={<MailboxesLoadingSkeleton />}>
			<MailboxesClientInner initialAccounts={initialAccounts} />
		</Suspense>
	)
} 