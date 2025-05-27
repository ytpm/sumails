'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
	Mail, 
	Calendar, 
	AlertCircle, 
	CheckCircle, 
	Eye,
	RefreshCw,
	ArrowLeft,
	MessageSquare,
	Lightbulb,
	TrendingUp
} from 'lucide-react'
import { InboxStatus, SummaryData } from '@/types/email'

interface SummaryViewProps {
	accountId: string
	onBack?: () => void
}

interface EmailSummary {
	id: string
	date_processed: string
	inbox_status: InboxStatus
	email_count: number
	summary_data: SummaryData
	created_at: string
}

export default function SummaryView({ accountId, onBack }: SummaryViewProps) {
	const [summaries, setSummaries] = useState<EmailSummary[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadSummaries()
	}, [accountId])

	const loadSummaries = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch(`/api/summaries/${accountId}?limit=10`)
			
			if (!response.ok) {
				throw new Error('Failed to load summaries')
			}

			const data = await response.json()
			setSummaries(data.summaries || [])

		} catch (error) {
			console.error('Error loading summaries:', error)
			setError('Failed to load summaries')
		} finally {
			setIsLoading(false)
		}
	}

	const getStatusBadge = (status: InboxStatus) => {
		const statusConfig = {
			'attention_needed': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
			'worth_a_look': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Eye },
			'all_clear': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
		}
		
		return statusConfig[status] || { 
			color: 'bg-gray-100 text-gray-800 border-gray-200', 
			icon: Calendar 
		}
	}

	const formatDate = (dateString: string): string => {
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
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center justify-center py-12">
					<RefreshCw className="h-8 w-8 animate-spin" />
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					{onBack && (
						<Button variant="ghost" size="sm" onClick={onBack}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
					)}
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Email Summaries</h1>
						<p className="text-muted-foreground mt-2">
							View your AI-generated email summaries
						</p>
					</div>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Summaries List */}
				{summaries.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Mail className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No summaries found</h3>
							<p className="text-muted-foreground text-center mb-6">
								Generate your first summary to see AI insights about your emails.
							</p>
							<Button onClick={() => window.location.href = '/account/mailboxes'}>
								<Mail className="h-4 w-4 mr-2" />
								Go to Mailboxes
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{summaries.map((summary) => {
							const statusBadge = getStatusBadge(summary.inbox_status)
							const summaryData = summary.summary_data

							return (
								<Card key={summary.id}>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div>
												<CardTitle className="flex items-center gap-3">
													<Calendar className="h-5 w-5" />
													{formatDate(summary.date_processed)}
												</CardTitle>
												<CardDescription className="flex items-center gap-2 mt-2">
													<Badge 
														variant="outline" 
														className={statusBadge.color}
													>
														<statusBadge.icon className="h-3 w-3 mr-1" />
														{summary.inbox_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
													</Badge>
													<span>•</span>
													<span>{summary.email_count} emails processed</span>
												</CardDescription>
											</div>
											<div className="text-sm text-muted-foreground">
												{new Date(summary.created_at).toLocaleTimeString()}
											</div>
										</div>
									</CardHeader>

									<CardContent>
										<div className="space-y-6">
											{/* Overview */}
											<div>
												<h4 className="font-medium mb-2 flex items-center gap-2">
													<TrendingUp className="h-4 w-4" />
													Overview
												</h4>
												<ul className="space-y-1 text-sm text-muted-foreground">
													{summaryData.overview.map((point, index) => (
														<li key={index} className="flex items-start gap-2">
															<span className="text-primary">•</span>
															<span>{point}</span>
														</li>
													))}
												</ul>
											</div>

											<Separator />

											{/* AI Insight */}
											<div>
												<h4 className="font-medium mb-2 flex items-center gap-2">
													<Lightbulb className="h-4 w-4" />
													AI Insight
												</h4>
												<p className="text-sm text-muted-foreground">
													{summaryData.insight}
												</p>
											</div>

											{/* Important Emails */}
											{summaryData.important_emails.length > 0 && (
												<>
													<Separator />
													<div>
														<h4 className="font-medium mb-3 flex items-center gap-2">
															<MessageSquare className="h-4 w-4" />
															Important Emails ({summaryData.important_emails.length})
														</h4>
														<div className="space-y-3">
															{summaryData.important_emails.map((email, index) => (
																<div key={index} className="p-3 bg-muted/50 rounded-lg">
																	<div className="font-medium text-sm">{email.subject}</div>
																	<div className="text-xs text-muted-foreground mt-1">
																		From: {email.sender}
																	</div>
																	{email.reason && (
																		<div className="text-xs text-muted-foreground mt-1">
																			Reason: {email.reason}
																		</div>
																	)}
																</div>
															))}
														</div>
													</div>
												</>
											)}

											{/* Suggestions */}
											{summaryData.suggestions && summaryData.suggestions.length > 0 && (
												<>
													<Separator />
													<div>
														<h4 className="font-medium mb-2 flex items-center gap-2">
															<Lightbulb className="h-4 w-4" />
															Suggestions
														</h4>
														<ul className="space-y-1 text-sm text-muted-foreground">
															{summaryData.suggestions.map((suggestion, index) => (
																<li key={index} className="flex items-start gap-2">
																	<span className="text-primary">💡</span>
																	<span>{suggestion}</span>
																</li>
															))}
														</ul>
													</div>
												</>
											)}
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}

				{/* Load More Button */}
				{summaries.length >= 10 && (
					<div className="text-center">
						<Button variant="outline" onClick={loadSummaries}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Load More
						</Button>
					</div>
				)}
			</div>
		</div>
	)
} 