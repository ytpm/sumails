'use client'

import { useEffect, useState, useRef } from 'react'
import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button'
import { RefreshCw, Mail, AlertCircle, Calendar, Package, Megaphone, CheckCircle, Clock, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import type { EmailDigest } from '@/types/email'
import type { TodayDigestWithAccount, TodayDigestsResponse } from '@/types/api'

// Component for individual highlight items
function HighlightItem({ highlight }: { highlight: { subject: string; sender: string; reason: string } }) {
	const getIconForHighlight = (subject: string, sender: string) => {
		const subjectLower = subject.toLowerCase()
		const senderLower = sender.toLowerCase()
		
		if (subjectLower.includes('urgent') || subjectLower.includes('action required') || subjectLower.includes('important')) {
			return <AlertCircle className="w-4 h-4 text-red-500" />
		}
		if (subjectLower.includes('meeting') || subjectLower.includes('calendar') || subjectLower.includes('appointment')) {
			return <Calendar className="w-4 h-4 text-blue-500" />
		}
		if (subjectLower.includes('order') || subjectLower.includes('shipping') || subjectLower.includes('delivery')) {
			return <Package className="w-4 h-4 text-green-500" />
		}
		if (senderLower.includes('no-reply') || subjectLower.includes('newsletter') || subjectLower.includes('promo')) {
			return <Megaphone className="w-4 h-4 text-purple-500" />
		}
		if (subjectLower.includes('confirm') || subjectLower.includes('complete') || subjectLower.includes('success')) {
			return <CheckCircle className="w-4 h-4 text-green-500" />
		}
		
		return <Mail className="w-4 h-4 text-gray-500" />
	}

	return (
		<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
			{getIconForHighlight(highlight.subject, highlight.sender)}
			<div className="flex-1 min-w-0">
				<p className="font-medium text-sm text-foreground leading-tight mb-1">
					{highlight.subject}
				</p>
				<p className="text-xs text-muted-foreground truncate mb-1">
					From: {highlight.sender}
				</p>
				<p className="text-xs text-blue-600 dark:text-blue-400">
					Reason: {highlight.reason}
				</p>
			</div>
		</div>
	)
}

// Component for individual account summary cards
function AccountSummaryCard({ digestWithAccount }: { digestWithAccount: TodayDigestWithAccount }) {
	const { digest, accountEmail, isExpired } = digestWithAccount
	const [isExpanded, setIsExpanded] = useState(false)
	const [contentHeight, setContentHeight] = useState(0)
	const contentRef = useRef<HTMLDivElement>(null)
	
	const toggleExpanded = () => {
		setIsExpanded(!isExpanded)
	}

	// Measure content height when component mounts or content changes
	useEffect(() => {
		if (contentRef.current) {
			setContentHeight(contentRef.current.scrollHeight)
		}
	}, [digest.important_emails, digest.suggestions, isExpanded])

	// Get status styling and icon
	const getStatusConfig = (status: string | undefined) => {
		switch (status) {
			case 'attention_needed':
				return {
					icon: '🚨',
					text: 'Attention Needed',
					bgColor: 'bg-red-100 dark:bg-red-900/30',
					textColor: 'text-red-800 dark:text-red-200',
					borderColor: 'border-red-200 dark:border-red-800'
				}
			case 'worth_a_look':
				return {
					icon: '👀',
					text: 'Worth a Look',
					bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
					textColor: 'text-yellow-800 dark:text-yellow-200',
					borderColor: 'border-yellow-200 dark:border-yellow-800'
				}
			case 'all_clear':
				return {
					icon: '✅',
					text: 'All Clear',
					bgColor: 'bg-green-100 dark:bg-green-900/30',
					textColor: 'text-green-800 dark:text-green-200',
					borderColor: 'border-green-200 dark:border-green-800'
				}
			default:
				return {
					icon: '📧',
					text: 'Legacy Format',
					bgColor: 'bg-gray-100 dark:bg-gray-900/30',
					textColor: 'text-gray-800 dark:text-gray-200',
					borderColor: 'border-gray-200 dark:border-gray-800'
				}
		}
	}

	const statusConfig = getStatusConfig(digest.inbox_status)
	
	return (
		<div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
			{/* Always visible header section */}
			<div 
				className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200"
				onClick={toggleExpanded}
			>
				{/* Account Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className={`w-3 h-3 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`} />
						<h3 className="font-semibold text-foreground">{accountEmail}</h3>
						
						{/* Status Badge */}
						<span className={`px-2 py-1 ${statusConfig.bgColor} ${statusConfig.textColor} text-xs font-medium rounded-full border ${statusConfig.borderColor} transition-all duration-200 ${
							isExpanded ? 'scale-105' : 'scale-100'
						}`}>
							{statusConfig.icon} {statusConfig.text}
						</span>

						{digest.important_emails.length > 0 && (
							<span className={`px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full transition-all duration-200 ${
								isExpanded ? 'scale-105' : 'scale-100'
							}`}>
								{digest.important_emails.length} important
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">
							{new Date(digest.created_at).toLocaleTimeString([], { 
								hour: '2-digit', 
								minute: '2-digit' 
							})}
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0"
							onClick={(e) => {
								e.stopPropagation()
								toggleExpanded()
							}}
						>
							<ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} />
						</Button>
					</div>
				</div>

				{/* Overview - Always visible */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium text-foreground flex items-center gap-2">
							📊 Overview
						</h4>
						{!isExpanded && digest.important_emails.length > 0 && (
							<span className="text-xs text-muted-foreground transition-opacity duration-200">
								Click to view details
							</span>
						)}
					</div>
					
					{/* Overview bullet points */}
					<div className="space-y-1">
						{digest.overview && digest.overview.length > 0 ? (
							digest.overview.map((point, index) => (
								<div key={index} className="flex items-start gap-2">
									<span className="text-muted-foreground mt-0.5">•</span>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{point}
									</p>
								</div>
							))
						) : (
							// Fallback for old format or missing overview
							<div className="flex items-start gap-2">
								<span className="text-muted-foreground mt-0.5">•</span>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{(digest as any).summary || 'No overview available'}
								</p>
							</div>
						)}
					</div>

					{/* AI Insight */}
					<div className="pt-2">
						<h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
							🧠 AI Insight
						</h4>
						<p className="text-sm text-muted-foreground leading-relaxed italic">
							{digest.insight || 'Processing email insights...'}
						</p>
					</div>
				</div>
			</div>

			{/* Expandable content */}
			<div 
				className="overflow-hidden transition-all duration-400 ease-in-out"
				style={{
					height: isExpanded ? `${contentHeight}px` : '0px'
				}}
			>
				<div ref={contentRef} className={`px-6 pb-6 border-t transition-all duration-300 ${
					isExpanded ? 'border-border/50 opacity-100' : 'border-transparent opacity-0'
				}`}>
					<div className="pt-4 space-y-4">
						{/* Important Emails */}
						{digest.important_emails.length > 0 && (
							<div className={`transform transition-all duration-300 ease-in-out ${
								isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
							}`}>
								<h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
									🔥 Important Emails ({digest.important_emails.length})
								</h4>
								<div className="space-y-2">
									{digest.important_emails.slice(0, 5).map((highlight, index) => (
										<div 
											key={index}
											className={`transform transition-all duration-200 ease-in-out ${
												isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
											}`}
											style={{
												transitionDelay: isExpanded ? `${index * 50 + 100}ms` : '0ms'
											}}
										>
											<HighlightItem highlight={highlight} />
										</div>
									))}
								</div>
							</div>
						)}

						{/* Suggestions for Cleanup */}
						{digest.suggestions && digest.suggestions.length > 0 && (
							<div 
								className={`transform transition-all duration-300 ease-in-out ${
									isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
								}`}
								style={{
									transitionDelay: isExpanded ? '250ms' : '0ms'
								}}
							>
								<div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
									<h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
										💡 Suggestions for Cleanup
									</h4>
									<ul className="list-disc list-inside space-y-1">
										{digest.suggestions.map((suggestion, index) => (
											<li key={index} className="text-sm text-blue-800 dark:text-blue-200">
												{suggestion}
											</li>
										))}
									</ul>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

// Loading skeleton component
function LoadingSkeleton() {
	return (
		<div className="space-y-6">
			{[1, 2].map((i) => (
				<div key={i} className="bg-card border border-border rounded-lg">
					<div className="p-6">
						<div className="animate-pulse">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="w-3 h-3 bg-gray-300 rounded-full"></div>
									<div className="h-4 bg-gray-300 rounded w-48"></div>
									<div className="h-5 bg-gray-200 rounded-full w-16"></div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-3 bg-gray-300 rounded w-12"></div>
									<div className="h-4 w-4 bg-gray-300 rounded"></div>
								</div>
							</div>
							<div className="space-y-2">
								<div className="h-3 bg-gray-300 rounded w-16"></div>
								<div className="h-3 bg-gray-300 rounded w-full"></div>
								<div className="h-3 bg-gray-300 rounded w-3/4"></div>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

// No data component
function NoDataCard() {
	return (
		<div className="text-center py-12 px-6">
			<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
				<Mail className="w-8 h-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				No email summaries for today
			</h3>
			<p className="text-muted-foreground mb-6 max-w-md mx-auto">
				Run email summarization on your connected accounts to see today's digest here.
			</p>
			<Button 
				onClick={() => window.location.href = '/dashboard/connected-emails'}
				variant="outline"
				className="shadow-sm"
			>
				Go to Connected Emails
			</Button>
		</div>
	)
}

// Summary header component
interface SummaryHeaderProps {
	date: string
	onRefresh: () => void
	isRefreshing: boolean
	onFetchToday?: () => void
	isFetchingToday?: boolean
	canFetchToday?: boolean
}

function SummaryHeader({ 
	date, 
	onRefresh, 
	isRefreshing, 
	onFetchToday, 
	isFetchingToday, 
	canFetchToday 
}: SummaryHeaderProps) {
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', { 
			weekday: 'long',
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		})
	}

	return (
		<div className="flex items-center justify-between mb-8">
			<div>
				<h1 className="text-3xl font-bold text-foreground mb-2">
					📅 {formatDate(date)}
				</h1>
			</div>
			<div className="flex items-center gap-2">
				{onFetchToday && (
					<Button
						onClick={onFetchToday}
						disabled={isFetchingToday || !canFetchToday}
						variant="default"
						className="shadow-sm ml-2 bg-blue-600 hover:bg-blue-700 text-white"
					>
						{isFetchingToday ? (
							<>
								<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
								Fetching All...
							</>
						) : (
							"🚀 Fetch All Today"
						)}
					</Button>
				)}
				<Button
					onClick={onRefresh}
					disabled={isRefreshing}
					variant="outline"
					className="shadow-sm"
				>
					<RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
					{isRefreshing ? 'Refreshing...' : 'Refresh'}
				</Button>
			</div>
		</div>
	)
}

// Main component
export default function TodaySummaryPage() {
	const [digests, setDigests] = useState<TodayDigestWithAccount[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [currentDate, setCurrentDate] = useState('')
	const [isFetchingToday, setIsFetchingToday] = useState(false)
	const [canFetchToday, setCanFetchToday] = useState(true)

	const loadTodayDigests = async () => {
		setIsLoading(true)
		try {
			const response = await fetch('/api/digests/today')
			const data: TodayDigestsResponse = await response.json()
			
			if (data.success) {
				setDigests(data.digests)
				setCurrentDate(data.date)
				console.log(`📊 Loaded ${data.total} email digests for today`)
			} else {
				console.error('❌ Failed to load today\'s digests')
				toast.error('Failed to load today\'s email summaries')
			}
		} catch (error) {
			console.error('❌ Error loading today\'s digests:', error)
			toast.error('Error loading email summaries')
		} finally {
			setIsLoading(false)
		}
	}

	const checkIfCanFetchToday = async () => {
		try {
			// For now, we'll assume fetching is always allowed
			// This can be enhanced later to check processing logs
			setCanFetchToday(true)
		} catch (error) {
			console.error('❌ Error checking fetch status:', error)
			setCanFetchToday(true)
		}
	}

	const handleFetchToday = async () => {
		// Get userId from first digest, or fetch from connected accounts if no digests exist
		let userId = digests[0]?.digest.userId

		if (!userId) {
			// If no digests exist, fetch userId from connected accounts
			try {
				const accountsResponse = await fetch('/api/auth/accounts/all')
				const accountsData = await accountsResponse.json()
				
				if (accountsData.accounts && accountsData.accounts.length > 0) {
					userId = accountsData.accounts[0].userId
					console.log(`🔍 Got userId from connected accounts: ${userId}`)
				} else {
					toast.error("No connected accounts found. Please connect an account first.")
					return
				}
			} catch (error) {
				console.error("❌ Error fetching connected accounts:", error)
				toast.error("Could not determine user ID. Please try refreshing the page.")
				return
			}
		}

		if (!userId) {
			toast.error("User ID not found. Cannot fetch emails.")
			return
		}

		console.log(`🚀 Starting fetch for userId: ${userId}`)
		setIsFetchingToday(true)
		toast.info("🚀 Starting to fetch and summarize today's emails for all accounts...")

		try {
			// This API route needs to be implemented/modified as per Phase 2, Step 3
			const response = await fetch('/api/emails/summarize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					userId,
					forceReprocess: true // Force reprocessing even if already done today
				}),
			})
			const data = await response.json()

			if (data.success) {
				toast.success(data.message || "Successfully processed today's emails for all accounts!")
				await loadTodayDigests() // Refresh the displayed digests
				await checkIfCanFetchToday() // Re-check if fetching is still allowed
			} else {
				toast.error(data.error || "Failed to process today's emails.")
			}
		} catch (error) {
			console.error("❌ Error fetching all today's emails:", error)
			toast.error("An error occurred while fetching emails.")
		} finally {
			setIsFetchingToday(false)
		}
	}

	const handleRefresh = async () => {
		await loadTodayDigests()
		toast.success('Email summaries refreshed!')
	}

	useEffect(() => {
		loadTodayDigests()
		checkIfCanFetchToday()
	}, [])

	useEffect(() => {
		// Re-check fetch status when digests change
		checkIfCanFetchToday()
	}, [digests])

	return (
		<ContentView>
			<SummaryHeader 
				date={currentDate || new Date().toISOString().split('T')[0]}
				onRefresh={handleRefresh}
				isRefreshing={isLoading}
				onFetchToday={handleFetchToday}
				isFetchingToday={isFetchingToday}
				canFetchToday={canFetchToday}
			/>

			{isLoading ? (
				<LoadingSkeleton />
			) : digests.length === 0 ? (
				<NoDataCard />
			) : (
				<div className="space-y-6">
					{digests.map((digestWithAccount) => (
						<AccountSummaryCard 
							key={digestWithAccount.digest.id} 
							digestWithAccount={digestWithAccount} 
						/>
					))}
				</div>
			)}
		</ContentView>
	)
} 