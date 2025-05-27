'use client'

import { useState, useEffect } from 'react'
import { 
	Dialog, 
	DialogContent, 
	DialogHeader, 
	DialogTitle,
	DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
	Calendar, 
	AlertCircle, 
	CheckCircle, 
	Eye, 
	ChevronDown, 
	ChevronRight,
	RefreshCw,
	Mail,
	Lightbulb,
	MessageSquare,
	ChevronLeft,
	ChevronRight as ChevronRightIcon
} from 'lucide-react'
import type { MailboxWithStatus } from '@/lib/services/mailboxes'
import { InboxStatus, SummaryData } from '@/types/email'

interface SummariesDialogProps {
	open: boolean
	onClose: () => void
	account: MailboxWithStatus | null
}

interface EmailSummary {
	id: string
	date_processed: string
	inbox_status: InboxStatus
	email_count: number
	summary_data: SummaryData
	created_at: string
}

export default function SummariesDialog({ open, onClose, account }: SummariesDialogProps) {
	const [summaries, setSummaries] = useState<EmailSummary[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expandedSummary, setExpandedSummary] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(false)
	const summariesPerPage = 10

	useEffect(() => {
		if (open && account) {
			loadSummaries(1)
		}
	}, [open, account])

	const loadSummaries = async (page: number) => {
		if (!account) return

		try {
			setIsLoading(true)
			setError(null)

			const offset = (page - 1) * summariesPerPage
			const response = await fetch(
				`/api/summaries/${account.id}?limit=${summariesPerPage}&offset=${offset}`
			)
			
			if (!response.ok) {
				throw new Error('Failed to load summaries')
			}

			const data = await response.json()
			
			if (page === 1) {
				setSummaries(data.summaries || [])
			} else {
				setSummaries(prev => [...prev, ...(data.summaries || [])])
			}
			
			setHasMore(data.summaries?.length === summariesPerPage)
			setCurrentPage(page)

		} catch (error) {
			console.error('Error loading summaries:', error)
			setError('Failed to load summaries')
		} finally {
			setIsLoading(false)
		}
	}

	const loadMore = () => {
		if (!isLoading && hasMore) {
			loadSummaries(currentPage + 1)
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

	const toggleExpanded = (summaryId: string) => {
		setExpandedSummary(expandedSummary === summaryId ? null : summaryId)
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Email Summaries - {account?.email}
					</DialogTitle>
					<DialogDescription>
						View and expand AI-generated email summaries for this account. Click on any summary to see detailed insights.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto">
					{error && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
							<p className="text-sm text-red-800">{error}</p>
						</div>
					)}

					{summaries.length === 0 && !isLoading ? (
						<div className="text-center py-8">
							<Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No summaries found</h3>
							<p className="text-muted-foreground">
								Generate your first summary to see AI insights about your emails.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{summaries.map((summary) => {
								const statusBadge = getStatusBadge(summary.inbox_status)
								const isExpanded = expandedSummary === summary.id

								return (
									<div key={summary.id} className="border rounded-lg">
										<div 
											className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => toggleExpanded(summary.id)}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													{isExpanded ? (
														<ChevronDown className="h-4 w-4 text-muted-foreground" />
													) : (
														<ChevronRight className="h-4 w-4 text-muted-foreground" />
													)}
													<Calendar className="h-4 w-4" />
													<span className="font-medium">{formatDate(summary.date_processed)}</span>
													<Badge 
														variant="outline" 
														className={statusBadge.color}
													>
														<statusBadge.icon className="h-3 w-3 mr-1" />
														{summary.inbox_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
													</Badge>
												</div>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<span>{summary.email_count} emails</span>
													<span>•</span>
													<span>{new Date(summary.created_at).toLocaleTimeString()}</span>
												</div>
											</div>
										</div>

										{isExpanded && (
											<div className="px-4 pb-4">
												<Separator className="mb-4" />
												<div className="space-y-4">
													{/* Overview */}
													<div>
														<h4 className="font-medium mb-2 flex items-center gap-2">
															<Calendar className="h-4 w-4" />
															Overview
														</h4>
														<ul className="space-y-1 text-sm text-muted-foreground">
															{summary.summary_data.overview.map((point, index) => (
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
															{summary.summary_data.insight}
														</p>
													</div>

													{/* Important Emails */}
													{summary.summary_data.important_emails.length > 0 && (
														<>
															<Separator />
															<div>
																<h4 className="font-medium mb-3 flex items-center gap-2">
																	<MessageSquare className="h-4 w-4" />
																	Important Emails ({summary.summary_data.important_emails.length})
																</h4>
																<div className="space-y-2">
																	{summary.summary_data.important_emails.map((email, index) => (
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
													{summary.summary_data.suggestions && summary.summary_data.suggestions.length > 0 && (
														<>
															<Separator />
															<div>
																<h4 className="font-medium mb-2 flex items-center gap-2">
																	<Lightbulb className="h-4 w-4" />
																	Suggestions
																</h4>
																<ul className="space-y-1 text-sm text-muted-foreground">
																	{summary.summary_data.suggestions.map((suggestion, index) => (
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
											</div>
										)}
									</div>
								)
							})}
						</div>
					)}

					{/* Loading State */}
					{isLoading && (
						<div className="flex items-center justify-center py-8">
							<RefreshCw className="h-6 w-6 animate-spin mr-2" />
							<span>Loading summaries...</span>
						</div>
					)}

					{/* Load More Button */}
					{hasMore && !isLoading && (
						<div className="text-center pt-4">
							<Button variant="outline" onClick={loadMore}>
								Load More
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
} 