'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardOverviewProps {}

export default function DashboardOverview({}: DashboardOverviewProps) {
	// Mock data
	const inboxPulse = {
		emailsToday: 86,
		importantEmails: 6,
		statusBreakdown: {
			attentionNeeded: 2,
			worthALook: 1,
			allClear: 3
		}
	}

	const recentSummaries = [
		{
			date: 'Today',
			status: 'Attention Needed',
			emailCount: 86,
			flaggedItems: 6
		},
		{
			date: 'Yesterday',
			status: 'All Clear',
			emailCount: 72,
			flaggedItems: 2
		},
		{
			date: '2 days ago',
			status: 'Worth a Look',
			emailCount: 94,
			flaggedItems: 4
		}
	]

	const connectedAccounts = [
		{
			email: 'john.doe@gmail.com',
			status: 'attention_needed',
			lastSummary: '2 hours ago'
		},
		{
			email: 'work@company.com',
			status: 'all_clear',
			lastSummary: '1 hour ago'
		},
		{
			email: 'personal@outlook.com',
			status: 'worth_a_look',
			lastSummary: '3 hours ago'
		}
	]

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			'attention_needed': 'bg-red-100 text-red-800 border-red-200',
			'Attention Needed': 'bg-red-100 text-red-800 border-red-200',
			'worth_a_look': 'bg-yellow-100 text-yellow-800 border-yellow-200',
			'Worth a Look': 'bg-yellow-100 text-yellow-800 border-yellow-200',
			'all_clear': 'bg-green-100 text-green-800 border-green-200',
			'All Clear': 'bg-green-100 text-green-800 border-green-200'
		}
		
		return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 border-gray-200'
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

			{/* Inbox Pulse */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						📬 Inbox Pulse
					</CardTitle>
					<CardDescription>
						Quick glance at today's email activity
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 bg-blue-50 rounded-lg border">
							<div className="text-2xl font-bold text-blue-600">
								{inboxPulse.emailsToday}
							</div>
							<div className="text-sm text-blue-700">emails received today</div>
						</div>
						<div className="text-center p-4 bg-orange-50 rounded-lg border">
							<div className="text-2xl font-bold text-orange-600">
								{inboxPulse.importantEmails}
							</div>
							<div className="text-sm text-orange-700">important emails flagged</div>
						</div>
						<div className="p-4 bg-gray-50 rounded-lg border">
							<div className="text-sm font-medium mb-2">Status Breakdown:</div>
							<div className="space-y-1 text-sm">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
									<span>{inboxPulse.statusBreakdown.attentionNeeded} Attention Needed</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
									<span>{inboxPulse.statusBreakdown.worthALook} Worth a Look</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
									<span>{inboxPulse.statusBreakdown.allClear} All Clear</span>
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
						🗓️ Recent Summaries
					</CardTitle>
					<CardDescription>
						Past 3 days overview
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{recentSummaries.map((summary, index) => (
							<div
								key={index}
								className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
							>
								<div className="flex justify-between items-start mb-2">
									<div className="font-medium">{summary.date}</div>
									<span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(summary.status)}`}>
										{summary.status}
									</span>
								</div>
								<div className="text-sm text-muted-foreground space-y-1">
									<div>{summary.emailCount} emails</div>
									<div>{summary.flaggedItems} flagged items</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Inbox Trends and AI Suggestions Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Inbox Trends */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							📊 Inbox Trends
						</CardTitle>
						<CardDescription>
							Weekly patterns and insights
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-3 bg-blue-50 rounded-lg border">
							<div className="font-medium text-blue-900">📈 320 emails this week</div>
							<div className="text-sm text-blue-700">+12% from last week</div>
						</div>
						<div className="p-3 bg-purple-50 rounded-lg border">
							<div className="font-medium text-purple-900">Top Senders</div>
							<div className="text-sm text-purple-700">Google, Railway, GoDaddy</div>
						</div>
						<div className="p-3 bg-green-50 rounded-lg border">
							<div className="font-medium text-green-900">Peak Activity</div>
							<div className="text-sm text-green-700">Mornings 8–10am</div>
						</div>
					</CardContent>
				</Card>

				{/* AI Suggestions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							💡 AI Suggestions
						</CardTitle>
						<CardDescription>
							Smart recommendations for your inbox
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
							<div className="font-medium text-amber-900 mb-2">
								Promotional Email Overload
							</div>
							<div className="text-sm text-amber-800 mb-3">
								You've received 84 promotional emails this week.
							</div>
							<div className="text-sm text-amber-800 mb-4">
								Consider unsubscribing from: bolt.new, Fiverr, Wix.
							</div>
							<Button variant="outline" size="sm" className="w-full">
								Create Filters
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Connected Account Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						📂 Connected Account Overview
					</CardTitle>
					<CardDescription>
						Manage your connected email accounts
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left py-2 px-4 font-medium">Email Address</th>
									<th className="text-left py-2 px-4 font-medium">Status</th>
									<th className="text-left py-2 px-4 font-medium">Last Summary</th>
									<th className="text-left py-2 px-4 font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{connectedAccounts.map((account, index) => (
									<tr key={index} className="border-b hover:bg-gray-50">
										<td className="py-3 px-4 font-medium">{account.email}</td>
										<td className="py-3 px-4">
											<span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(account.status)}`}>
												{account.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
											</span>
										</td>
										<td className="py-3 px-4 text-sm text-muted-foreground">
											{account.lastSummary}
										</td>
										<td className="py-3 px-4">
											<div className="flex gap-2">
												<Button variant="outline" size="sm">
													Sync
												</Button>
												<Button variant="ghost" size="sm">
													View
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 