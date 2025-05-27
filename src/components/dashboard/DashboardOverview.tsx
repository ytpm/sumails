'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
	RefreshCw, 
	AlertCircle, 
	CheckCircle, 
	Eye,
	Calendar,
	TrendingUp,
	Mail,
	Zap
} from 'lucide-react'
import { InboxStatus } from '@/types/email'

interface DashboardOverviewProps {}

interface SummaryStatus {
	accountId: string
	accountEmail: string
	lastSummaryDate?: string
	lastSummaryStatus?: InboxStatus
	hasRecentSummary: boolean
}

interface DashboardStats {
	totalAccounts: number
	emailsToday: number
	importantEmails: number
	statusBreakdown: {
		attentionNeeded: number
		worthALook: number
		allClear: number
	}
}

export default function DashboardOverview({}: DashboardOverviewProps) {
	const [summaryStatuses, setSummaryStatuses] = useState<SummaryStatus[]>([])
	const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
		totalAccounts: 0,
		emailsToday: 0,
		importantEmails: 0,
		statusBreakdown: {
			attentionNeeded: 0,
			worthALook: 0,
			allClear: 0
		}
	})
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadDashboardData()
	}, [])

	const loadDashboardData = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Load summary statuses
			const response = await fetch('/api/summaries')
			
			if (!response.ok) {
				throw new Error('Failed to load dashboard data')
			}

			const data = await response.json()
			const accounts = data.accounts || []
			setSummaryStatuses(accounts)

			// Calculate dashboard stats
			const stats: DashboardStats = {
				totalAccounts: accounts.length,
				emailsToday: 0,
				importantEmails: 0,
				statusBreakdown: {
					attentionNeeded: 0,
					worthALook: 0,
					allClear: 0
				}
			}

			accounts.forEach((account: SummaryStatus) => {
				if (account.hasRecentSummary) {
					switch (account.lastSummaryStatus) {
						case 'attention_needed':
							stats.statusBreakdown.attentionNeeded++
							break
						case 'worth_a_look':
							stats.statusBreakdown.worthALook++
							break
						case 'all_clear':
							stats.statusBreakdown.allClear++
							break
					}
				}
			})

			setDashboardStats(stats)

		} catch (error) {
			console.error('Error loading dashboard data:', error)
			setError('Failed to load dashboard data')
		} finally {
			setIsLoading(false)
		}
	}

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			'attention_needed': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
			'Attention Needed': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
			'worth_a_look': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Eye },
			'Worth a Look': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Eye },
			'all_clear': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
			'All Clear': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
		}
		
		return statusConfig[status as keyof typeof statusConfig] || { 
			color: 'bg-gray-100 text-gray-800 border-gray-200', 
			icon: Calendar 
		}
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
		return (
			<div className="space-y-6 p-6">
				<div className="flex items-center justify-center py-12">
					<RefreshCw className="h-8 w-8 animate-spin" />
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
				<p className="text-muted-foreground">
					Your email intelligence at a glance
				</p>
			</div>

			{/* Error Alert */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Inbox Pulse */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						📬 Inbox Pulse
					</CardTitle>
					<CardDescription>
						Quick glance at your connected accounts
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 bg-blue-50 rounded-lg border">
							<div className="text-2xl font-bold text-blue-600">
								{dashboardStats.totalAccounts}
							</div>
							<div className="text-sm text-blue-700">connected accounts</div>
						</div>
						<div className="text-center p-4 bg-orange-50 rounded-lg border">
							<div className="text-2xl font-bold text-orange-600">
								{dashboardStats.statusBreakdown.attentionNeeded + dashboardStats.statusBreakdown.worthALook}
							</div>
							<div className="text-sm text-orange-700">accounts need attention</div>
						</div>
						<div className="p-4 bg-gray-50 rounded-lg border">
							<div className="text-sm font-medium mb-2">Status Breakdown:</div>
							<div className="space-y-1 text-sm">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
									<span>{dashboardStats.statusBreakdown.attentionNeeded} Attention Needed</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
									<span>{dashboardStats.statusBreakdown.worthALook} Worth a Look</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
									<span>{dashboardStats.statusBreakdown.allClear} All Clear</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recent Summaries */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						🗓️ Account Summary Status
					</CardTitle>
					<CardDescription>
						Latest summary status for all connected accounts
					</CardDescription>
				</CardHeader>
				<CardContent>
					{summaryStatuses.length === 0 ? (
						<div className="text-center py-8">
							<Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No connected accounts</h3>
							<p className="text-muted-foreground mb-4">
								Connect your first email account to start receiving summaries.
							</p>
							<Button onClick={() => window.location.href = '/account/mailboxes'}>
								<Mail className="h-4 w-4 mr-2" />
								Connect Account
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{summaryStatuses.map((account, index) => {
								const statusBadge = account.lastSummaryStatus 
									? getStatusBadge(account.lastSummaryStatus)
									: getStatusBadge('never')

								return (
									<div
										key={index}
										className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
									>
										<div className="flex justify-between items-start mb-2">
											<div className="font-medium truncate">{account.accountEmail}</div>
											{account.lastSummaryStatus && (
												<Badge 
													variant="outline" 
													className={statusBadge.color}
												>
													<statusBadge.icon className="h-3 w-3 mr-1" />
													{account.lastSummaryStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
												</Badge>
											)}
										</div>
										<div className="text-sm text-muted-foreground space-y-1">
											<div className="flex items-center gap-2">
												<Calendar className="h-3 w-3" />
												Last Summary: {formatLastSummaryDate(account.lastSummaryDate)}
											</div>
											<div>
												Recent: {account.hasRecentSummary ? 'Yes' : 'No'}
											</div>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Actions and AI Suggestions Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							⚡ Quick Actions
						</CardTitle>
						<CardDescription>
							Manage your email summaries
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button 
							className="w-full" 
							onClick={() => window.location.href = '/account/mailboxes'}
						>
							<Mail className="h-4 w-4 mr-2" />
							Manage Mailboxes
						</Button>
						<Button 
							variant="outline" 
							className="w-full"
							onClick={loadDashboardData}
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh Dashboard
						</Button>
						<Separator />
						<div className="text-sm text-muted-foreground">
							<p>• Summaries are generated automatically daily</p>
							<p>• Connect more accounts to get comprehensive insights</p>
							<p>• Check mailboxes page for manual summary generation</p>
						</div>
					</CardContent>
				</Card>

				{/* System Status */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							📊 System Status
						</CardTitle>
						<CardDescription>
							Summary system health and activity
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-3 bg-green-50 rounded-lg border">
							<div className="font-medium text-green-900">✅ System Operational</div>
							<div className="text-sm text-green-700">All services running normally</div>
						</div>
						<div className="p-3 bg-blue-50 rounded-lg border">
							<div className="font-medium text-blue-900">🤖 AI Processing</div>
							<div className="text-sm text-blue-700">OpenAI GPT-4o integration active</div>
						</div>
						<div className="p-3 bg-purple-50 rounded-lg border">
							<div className="font-medium text-purple-900">📱 Notifications</div>
							<div className="text-sm text-purple-700">Console logging enabled (Phase 3)</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Help Section */}
			<Card>
				<CardHeader>
					<CardTitle>📬 Summary System</CardTitle>
					<CardDescription>
						How the Sumails summary system works
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div className="p-3 bg-blue-50 rounded-lg border">
							<div className="font-medium text-blue-900 mb-2">🔌 Automatic Summaries</div>
							<div className="text-blue-700">
								Summaries are generated automatically when you connect a mailbox and daily via CRON jobs.
							</div>
						</div>
						<div className="p-3 bg-green-50 rounded-lg border">
							<div className="font-medium text-green-900 mb-2">🤖 AI-Powered</div>
							<div className="text-green-700">
								Our AI analyzes your emails and provides intelligent insights and highlights.
							</div>
						</div>
						<div className="p-3 bg-purple-50 rounded-lg border">
							<div className="font-medium text-purple-900 mb-2">📱 Smart Notifications</div>
							<div className="text-purple-700">
								Get notified only when there's something important in your inbox.
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 