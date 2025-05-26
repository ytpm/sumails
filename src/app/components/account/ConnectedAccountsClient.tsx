'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { Mail, Plus, Trash2, RefreshCw, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

interface ConnectedAccount {
	id: string
	email: string
	provider: string
	status: 'active' | 'error' | 'expired'
	lastSync?: string
	emailCount?: number
}

interface ConnectedAccountsClientProps {
	initialAccounts: ConnectedAccount[]
}

export default function ConnectedAccountsClient({ initialAccounts }: ConnectedAccountsClientProps) {
	const router = useRouter()
	const { isLoading, isAuthenticated } = useAuth()
	const [accounts, setAccounts] = useState<ConnectedAccount[]>(initialAccounts)
	const [isConnecting, setIsConnecting] = useState(false)
	const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

	// Redirect if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/auth/login')
		}
	}, [isLoading, isAuthenticated, router])

	// Mock data for demonstration
	useEffect(() => {
		// Simulate loading connected accounts
		const mockAccounts: ConnectedAccount[] = [
			{
				id: '1',
				email: 'john.doe@gmail.com',
				provider: 'Google',
				status: 'active',
				lastSync: '2 hours ago',
				emailCount: 156
			},
			{
				id: '2',
				email: 'work@company.com',
				provider: 'Google',
				status: 'active',
				lastSync: '1 hour ago',
				emailCount: 89
			},
			{
				id: '3',
				email: 'old.account@gmail.com',
				provider: 'Google',
				status: 'expired',
				lastSync: '3 days ago',
				emailCount: 0
			}
		]
		setAccounts(mockAccounts)
	}, [])

	const handleConnectAccount = async () => {
		try {
			setIsConnecting(true)
			// TODO: Implement Google OAuth flow
			// For now, simulate the connection process
			await new Promise(resolve => setTimeout(resolve, 2000))
			
			// Simulate adding a new account
			const newAccount: ConnectedAccount = {
				id: Date.now().toString(),
				email: 'new.account@gmail.com',
				provider: 'Google',
				status: 'active',
				lastSync: 'Just now',
				emailCount: 0
			}
			
			setAccounts(prev => [...prev, newAccount])
			toast.success('Account connected successfully!')
		} catch (error) {
			toast.error('Failed to connect account. Please try again.')
		} finally {
			setIsConnecting(false)
		}
	}

	const handleDisconnectAccount = async (accountId: string, email: string) => {
		try {
			setDisconnectingId(accountId)
			// TODO: Implement actual disconnection logic
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			setAccounts(prev => prev.filter(account => account.id !== accountId))
			toast.success(`${email} disconnected successfully`)
		} catch (error) {
			toast.error('Failed to disconnect account. Please try again.')
		} finally {
			setDisconnectingId(null)
		}
	}

	const handleSyncAccount = async (accountId: string, email: string) => {
		try {
			// TODO: Implement actual sync logic
			await new Promise(resolve => setTimeout(resolve, 1500))
			
			setAccounts(prev => prev.map(account => 
				account.id === accountId 
					? { ...account, lastSync: 'Just now', status: 'active' as const }
					: account
			))
			toast.success(`${email} synced successfully`)
		} catch (error) {
			toast.error('Failed to sync account. Please try again.')
		}
	}

	const getStatusIcon = (status: ConnectedAccount['status']) => {
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

	const getStatusText = (status: ConnectedAccount['status']) => {
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
						<h1 className="text-3xl font-bold text-foreground">Connected Accounts</h1>
						<p className="text-muted-foreground mt-2">
							Manage your connected email accounts and view their status
						</p>
					</div>
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
						{isConnecting ? 'Connecting...' : 'Connect Account'}
					</Button>
				</div>

				{/* Connected Accounts List */}
				<div className="space-y-4">
					{accounts.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Mail className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No Connected Accounts</h3>
								<p className="text-muted-foreground text-center mb-6">
									Connect your email accounts to start receiving daily summaries
								</p>
								<Button onClick={handleConnectAccount} disabled={isConnecting}>
									{isConnecting ? (
										<RefreshCw className="h-4 w-4 animate-spin mr-2" />
									) : (
										<Plus className="h-4 w-4 mr-2" />
									)}
									{isConnecting ? 'Connecting...' : 'Connect Your First Account'}
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
												disabled={disconnectingId === account.id}
											>
												<RefreshCw className="h-4 w-4 mr-2" />
												Sync
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDisconnectAccount(account.id, account.email)}
												disabled={disconnectingId === account.id}
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
												This account's authorization has expired. Please reconnect to continue receiving summaries.
											</p>
										</div>
									)}
									{account.status === 'error' && (
										<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
											<p className="text-sm text-red-800">
												There was an error accessing this account. Please try syncing or reconnecting.
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
							<p>• Connected accounts allow Sumails to access and summarize your emails</p>
							<p>• We only read email metadata and content for summarization purposes</p>
							<p>• You can disconnect accounts at any time</p>
							<p>• Sync manually to get the latest email summaries</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 