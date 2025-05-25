'use client'

import { useEffect, useState, useRef } from 'react'
import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Mail, AlertCircle, Calendar, Package, Megaphone, CheckCircle, Clock, ChevronDown, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import type { EmailDigest } from '@/types/email'

interface DigestWithAccount {
	digest: EmailDigest
	accountEmail: string
	isExpired: boolean
}

interface DigestsResponse {
	success: boolean
	date: string
	digests: DigestWithAccount[]
	total: number
}

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
function AccountSummaryCard({ digestWithAccount }: { digestWithAccount: DigestWithAccount }) {
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
									Email digest available
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Expandable content */}
			<div 
				className="overflow-hidden transition-all duration-300 ease-in-out"
				style={{ 
					maxHeight: isExpanded ? `${contentHeight}px` : '0px',
					opacity: isExpanded ? 1 : 0
				}}
			>
				<div ref={contentRef} className="px-6 pb-6 space-y-6">
					{/* Important Emails Section */}
					{digest.important_emails && digest.important_emails.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-sm font-medium text-foreground flex items-center gap-2">
								🔥 Important Emails ({digest.important_emails.length})
							</h4>
							<div className="space-y-2">
								{digest.important_emails.map((highlight, index) => (
									<HighlightItem key={index} highlight={highlight} />
								))}
							</div>
						</div>
					)}

					{/* Suggestions Section */}
					{digest.suggestions && digest.suggestions.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-sm font-medium text-foreground flex items-center gap-2">
								💡 Suggestions ({digest.suggestions.length})
							</h4>
							<div className="space-y-2">
								{digest.suggestions.map((suggestion, index) => (
									<div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
										<span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
										<p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
											{suggestion}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Stats Section */}
					<div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
						<div className="text-center p-3 rounded-lg bg-muted/30">
							<div className="text-lg font-semibold text-foreground">{digest.overview?.length || 0}</div>
							<div className="text-xs text-muted-foreground">Overview Points</div>
						</div>
						<div className="text-center p-3 rounded-lg bg-muted/30">
							<div className="text-lg font-semibold text-foreground">{digest.important_emails?.length || 0}</div>
							<div className="text-xs text-muted-foreground">Important</div>
						</div>
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
			{[1, 2, 3].map((i) => (
				<div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-3 h-3 rounded-full bg-muted" />
						<div className="h-5 bg-muted rounded w-48" />
						<div className="h-6 bg-muted rounded-full w-24" />
					</div>
					<div className="space-y-2">
						<div className="h-4 bg-muted rounded w-full" />
						<div className="h-4 bg-muted rounded w-3/4" />
						<div className="h-4 bg-muted rounded w-1/2" />
					</div>
				</div>
			))}
		</div>
	)
}

// No data card component
function NoDataCard() {
	return (
		<div className="bg-card border border-border rounded-lg p-12 text-center">
			<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
				<Mail className="w-8 h-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				No Email Summaries Found
			</h3>
			<p className="text-muted-foreground mb-6 max-w-md mx-auto">
				No email summaries were found for the selected date. Try selecting a different date or check if your accounts were connected at that time.
			</p>
		</div>
	)
}

// Date picker component
interface DatePickerProps {
	selectedDate: string
	onDateChange: (date: string) => void
	onFetch: () => void
	isLoading: boolean
}

function DatePicker({ selectedDate, onDateChange, onFetch, isLoading }: DatePickerProps) {
	const today = new Date().toISOString().split('T')[0]
	
	return (
		<div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg shadow-sm">
			<div className="flex items-center gap-2">
				<CalendarDays className="w-5 h-5 text-muted-foreground" />
				<Label htmlFor="date-picker" className="text-sm font-medium">
					Select Date:
				</Label>
			</div>
			<Input
				id="date-picker"
				type="date"
				value={selectedDate}
				onChange={(e) => onDateChange(e.target.value)}
				max={today}
				className="w-auto"
			/>
			<Button
				onClick={onFetch}
				disabled={isLoading || !selectedDate}
				variant="default"
				className="shadow-sm"
			>
				{isLoading ? (
					<>
						<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
						Loading...
					</>
				) : (
					<>
						<Calendar className="w-4 h-4 mr-2" />
						Fetch Summary
					</>
				)}
			</Button>
		</div>
	)
}

// Summary header component
interface SummaryHeaderProps {
	date: string
	onRefresh: () => void
	isRefreshing: boolean
}

function SummaryHeader({ date, onRefresh, isRefreshing }: SummaryHeaderProps) {
	const formatDate = (dateStr: string) => {
		if (!dateStr) return 'Select a Date'
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
					📅 Email Summary
				</h1>
				<p className="text-lg text-muted-foreground">
					{formatDate(date)}
				</p>
			</div>
			{date && (
				<Button
					onClick={onRefresh}
					disabled={isRefreshing}
					variant="outline"
					className="shadow-sm"
				>
					<RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
					{isRefreshing ? 'Refreshing...' : 'Refresh'}
				</Button>
			)}
		</div>
	)
}

// Main component
export default function SummaryPage() {
	const [digests, setDigests] = useState<DigestWithAccount[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [selectedDate, setSelectedDate] = useState('')
	const [hasSearched, setHasSearched] = useState(false)

	const loadDigestsByDate = async (date: string) => {
		if (!date) return
		
		setIsLoading(true)
		setHasSearched(true)
		
		try {
			const response = await fetch(`/api/digests/by-date?date=${date}`)
			const data: DigestsResponse = await response.json()
			
			if (data.success) {
				setDigests(data.digests)
				console.log(`📊 Loaded ${data.total} email digests for ${date}`)
				if (data.total === 0) {
					toast.info(`No email summaries found for ${date}`)
				} else {
					toast.success(`Found ${data.total} email summaries for ${date}`)
				}
			} else {
				console.error('❌ Failed to load digests for date:', date)
				toast.error('Failed to load email summaries for the selected date')
				setDigests([])
			}
		} catch (error) {
			console.error('❌ Error loading digests for date:', error)
			toast.error('Error loading email summaries')
			setDigests([])
		} finally {
			setIsLoading(false)
		}
	}

	const handleDateChange = (date: string) => {
		setSelectedDate(date)
		setHasSearched(false)
		setDigests([])
	}

	const handleFetch = () => {
		if (selectedDate) {
			loadDigestsByDate(selectedDate)
		}
	}

	const handleRefresh = () => {
		if (selectedDate) {
			loadDigestsByDate(selectedDate)
		}
	}

	// Set default date to today
	useEffect(() => {
		const today = new Date().toISOString().split('T')[0]
		setSelectedDate(today)
	}, [])

	return (
		<ContentView>
			<SummaryHeader 
				date={selectedDate}
				onRefresh={handleRefresh}
				isRefreshing={isLoading}
			/>

			<div className="space-y-6">
				<DatePicker
					selectedDate={selectedDate}
					onDateChange={handleDateChange}
					onFetch={handleFetch}
					isLoading={isLoading}
				/>

				{isLoading ? (
					<LoadingSkeleton />
				) : hasSearched && digests.length === 0 ? (
					<NoDataCard />
				) : digests.length > 0 ? (
					<div className="space-y-6">
						{digests.map((digestWithAccount) => (
							<AccountSummaryCard 
								key={digestWithAccount.digest.id} 
								digestWithAccount={digestWithAccount} 
							/>
						))}
					</div>
				) : (
					<div className="bg-card border border-border rounded-lg p-12 text-center">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
							<CalendarDays className="w-8 h-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Select a Date
						</h3>
						<p className="text-muted-foreground max-w-md mx-auto">
							Choose a date from the date picker above to view email summaries for that day.
						</p>
					</div>
				)}
			</div>
		</ContentView>
	)
}
