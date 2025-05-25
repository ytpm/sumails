'use client';

import { useState, useEffect } from 'react'
import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Download, AlertTriangle, Trash2 } from 'lucide-react';
import { FloatingToc } from '@/components/ui/floating-toc';

export default function SettingsPage() {
	const [activeSection, setActiveSection] = useState<string>('')
	const [isManualScrolling, setIsManualScrolling] = useState(false)
	const [inboxViewMode, setInboxViewMode] = useState<'unified' | 'per-account'>('unified')

	// Placeholder for timezones - in a real app, this would be more comprehensive
	const timezones = [
		{ value: "Etc/GMT+12", label: "(GMT-12:00) International Date Line West" },
		{ value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
		{ value: "Europe/London", label: "(GMT+00:00) London" },
		{ value: "Asia/Jerusalem", label: "(GMT+02:00) Jerusalem" },
		{ value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
	];

	const summaryTimes = Array.from({ length: 24 }, (_, i) => {
		const hour = i.toString().padStart(2, '0');
		return { value: `${hour}:00`, label: `${hour}:00` };
	});

	// Table of contents data
	const tocItems = [
		{
			id: 'user-settings',
			title: 'User Settings',
			description: 'Personal account details and preferences'
		},
		{
			id: 'summary-preferences',
			title: 'Email Summary Preferences',
			description: 'Customize how and when you receive summaries'
		},
		{
			id: 'notifications',
			title: 'Notifications',
			description: 'Choose which notifications to receive'
		},
		{
			id: 'cleanup-preferences',
			title: 'Inbox Cleanup Preferences',
			description: 'Manage automated cleanup suggestions'
		},
		{
			id: 'privacy-data',
			title: 'Privacy and Data',
			description: 'Manage your data and privacy settings'
		},
		{
			id: 'account-management',
			title: 'Account Management',
			description: 'Delete account and manage access'
		}
	];

	// Intersection Observer for active section tracking
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				// Skip updates if we're manually scrolling
				if (isManualScrolling) return
				
				// Get all currently intersecting entries
				const intersectingEntries = entries.filter(entry => entry.isIntersecting)
				
				if (intersectingEntries.length > 0) {
					// Find the section whose top is closest to the top of the viewport
					let activeEntry = intersectingEntries[0]
					let minDistance = Infinity
					
					for (const entry of intersectingEntries) {
						const rect = entry.target.getBoundingClientRect()
						// Calculate distance from top of viewport (we want the section whose top is closest to viewport top)
						const distanceFromTop = Math.abs(rect.top)
						
						if (distanceFromTop < minDistance) {
							minDistance = distanceFromTop
							activeEntry = entry
						}
					}
					
					setActiveSection(activeEntry.target.id)
				}
			},
			{
				// Use a small top margin to trigger when section top enters viewport
				rootMargin: '-50px 0px -50% 0px',
				threshold: [0, 0.1]
			}
		)

		tocItems.forEach(item => {
			const element = document.getElementById(item.id)
			if (element) {
				observer.observe(element)
			}
		})

		// Also listen to scroll events for better last section detection
		const handleScroll = () => {
			// Skip if manually scrolling
			if (isManualScrolling) return
			
			const windowHeight = window.innerHeight
			const documentHeight = document.documentElement.scrollHeight
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop
			const distanceFromBottom = documentHeight - (scrollTop + windowHeight)
			
			// Only override intersection observer for the bottom sections
			// If we're at the very bottom (within 10px), highlight the last section
			if (distanceFromBottom <= 10) {
				const lastSection = tocItems[tocItems.length - 1]
				setActiveSection(lastSection.id)
			}
			// If we're close to bottom but not at it, and the current active section is the last one,
			// switch to second-to-last to prevent premature highlighting of the last section
			else if (distanceFromBottom > 10 && distanceFromBottom <= 100) {
				const lastSection = tocItems[tocItems.length - 1]
				const secondToLastSection = tocItems[tocItems.length - 2]
				
				// Only override if the last section is currently active (to switch it back)
				if (activeSection === lastSection.id && secondToLastSection) {
					setActiveSection(secondToLastSection.id)
				}
			}
			// For all other cases, let the intersection observer handle it naturally
		}

		window.addEventListener('scroll', handleScroll, { passive: true })

		return () => {
			observer.disconnect()
			window.removeEventListener('scroll', handleScroll)
		}
	}, [tocItems, isManualScrolling])

	return (
		<ContentView>
			<div className="flex gap-8 max-w-7xl mx-auto pb-12">
				{/* Table of Contents - Left Side */}
				<div className="hidden lg:block w-64 flex-shrink-0">
					<div className="sticky top-0">
						<div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-sm p-4 mt-1.5">
							<h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
								Contents
							</h3>
							<nav className="space-y-1">
								{tocItems.map((item) => (
									<button
										key={item.id}
										onClick={() => {
											// Set manual scrolling flag and immediately update active section
											setIsManualScrolling(true)
											setActiveSection(item.id)
											
											const element = document.getElementById(item.id)
											if (element) {
												element.scrollIntoView({
													behavior: 'smooth',
													block: 'start'
												})
												
												// Re-enable observer after scroll completes
												setTimeout(() => {
													setIsManualScrolling(false)
												}, 1000) // Give enough time for smooth scroll to complete
											}
										}}
										className={`w-full text-left p-2 rounded-md text-sm transition-all duration-200 hover:bg-muted/50 hover:text-foreground focus:outline-none focus:bg-muted/30 border-l-2 ${
											activeSection === item.id
												? 'bg-primary/10 text-primary border-primary font-medium'
												: 'text-muted-foreground border-transparent hover:border-primary/20'
										}`}
									>
										<div className="font-medium">{item.title}</div>
										{item.description && (
											<div className="text-xs text-muted-foreground mt-0.5 overflow-hidden" style={{ 
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical'
											}}>
												{item.description}
											</div>
										)}
									</button>
								))}
							</nav>
						</div>
					</div>
				</div>

				{/* Settings Content - Right Side */}
				<div className="flex-1 space-y-10 min-w-0">
					{/* Mobile TOC Toggle */}
					<div className="lg:hidden mb-6">
						<FloatingToc items={tocItems} />
					</div>

					{/* User Settings */}
					<Card id="user-settings">
						<CardHeader>
							<CardTitle>User Settings</CardTitle>
							<CardDescription>Manage your personal account details and preferences.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="displayName">Display Name</Label>
									<Input id="displayName" defaultValue="Current User Name" placeholder="Your Name" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input id="email" type="email" defaultValue="user@example.com" disabled />
								</div>
							</div>

							<Separator className="my-6" />

							<div>
								<Label className="text-base font-medium">Password</Label>
								<CardDescription className="text-sm mb-4">Update your password. Ensure it is strong and unique.</CardDescription>
								<div className="space-y-3 max-w-sm">
									<Input id="currentPassword" type="password" placeholder="Current Password" />
									<Input id="newPassword" type="password" placeholder="New Password" />
									<Input id="confirmNewPassword" type="password" placeholder="Confirm New Password" />
								</div>
								<Button variant="outline" className="mt-4">Change Password</Button>
							</div>

							<Separator className="my-6" />

							<div className="space-y-2 max-w-sm">
								<Label htmlFor="timezone">User Timezone</Label>
								<Select defaultValue="Asia/Jerusalem">
									<SelectTrigger id="timezone">
										<SelectValue placeholder="Select timezone" />
									</SelectTrigger>
									<SelectContent>
										{timezones.map(tz => (
											<SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">For daily summary scheduling and accurate timestamps.</p>
							</div>
						</CardContent>
						<CardFooter>
							<Button>Save User Settings</Button>
						</CardFooter>
					</Card>

					{/* Email Summary Preferences */}
					<Card id="summary-preferences">
						<CardHeader>
							<CardTitle>Email Summary Preferences</CardTitle>
							<CardDescription>Customize how and when you receive your email summaries.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2 max-w-xs">
								<Label htmlFor="summaryTime">Preferred Summary Time</Label>
								<Select defaultValue="08:00">
									<SelectTrigger id="summaryTime">
										<SelectValue placeholder="Select time" />
									</SelectTrigger>
									<SelectContent>
										{summaryTimes.map(time => (
											<SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-3">
								<Label className="text-base font-medium">Summary Delivery Method</Label>
								<div className="flex items-center space-x-3 p-3 border rounded-md">
									<Switch id="deliveryDashboard" defaultChecked />
									<Label htmlFor="deliveryDashboard" className="font-normal flex-1">Dashboard Only</Label>
								</div>
								<div className="flex items-center space-x-3 p-3 border rounded-md">
									<Switch id="deliveryEmail" />
									<Label htmlFor="deliveryEmail" className="font-normal flex-1">Email</Label>
								</div>
								<div className="flex items-center space-x-3 p-3 border rounded-md opacity-60">
									<Switch id="deliveryWhatsapp" disabled />
									<Label htmlFor="deliveryWhatsapp" className="font-normal flex-1">WhatsApp (Coming Soon)</Label>
								</div>
							</div>
							<div className="space-y-3">
								<Label className="text-base font-medium">Default Inbox View Mode</Label>
								<div className="flex items-center space-x-3 p-3 border rounded-md">
									<Switch 
										id="viewUnified" 
										checked={inboxViewMode === 'unified'}
										onCheckedChange={() => setInboxViewMode(inboxViewMode === 'unified' ? 'per-account' : 'unified')}
									/>
									<Label htmlFor="viewUnified" className="font-normal flex-1">All Inboxes Unified</Label>
								</div>
								<div className="flex items-center space-x-3 p-3 border rounded-md">
									<Switch 
										id="viewPerAccount" 
										checked={inboxViewMode === 'per-account'}
										onCheckedChange={() => setInboxViewMode(inboxViewMode === 'per-account' ? 'unified' : 'per-account')}
									/>
									<Label htmlFor="viewPerAccount" className="font-normal flex-1">One at a Time (Per Account)</Label>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button>Save Summary Preferences</Button>
						</CardFooter>
					</Card>

					{/* Notifications */}
					<Card id="notifications">
						<CardHeader>
							<CardTitle>Notifications</CardTitle>
							<CardDescription>Choose which notifications you want to receive.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="flex items-center justify-between p-3 border rounded-md">
								<Label htmlFor="notifSummary" className="font-normal">Email Summary Notifications</Label>
								<Switch id="notifSummary" defaultChecked />
							</div>
							<div className="flex items-center justify-between p-3 border rounded-md">
								<Label htmlFor="notifUrgent" className="font-normal">Urgent Alert Emails</Label>
								<Switch id="notifUrgent" defaultChecked />
							</div>
							<div className="flex items-center justify-between p-3 border rounded-md">
								<Label htmlFor="notifPromo" className="font-normal">Unimportant/Promo Alerts</Label>
								<Switch id="notifPromo" />
							</div>
							<div className="flex items-center justify-between p-3 border rounded-md">
								<Label htmlFor="notifFallback" className="font-normal">Digest Fallback Alert (if summary fails)</Label>
								<Switch id="notifFallback" defaultChecked />
							</div>
						</CardContent>
						<CardFooter>
							<Button>Save Notification Settings</Button>
						</CardFooter>
					</Card>

					{/* Inbox Cleanup Preferences */}
					<Card id="cleanup-preferences">
						<CardHeader>
							<CardTitle>Inbox Cleanup Preferences</CardTitle>
							<CardDescription>Manage automated cleanup suggestions and display.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div>
								<Label className="text-base font-medium mb-3 block">Auto-suggest unsubscribe for:</Label>
								<div className="space-y-3">
									<div className="flex items-center space-x-3 p-3 border rounded-md">
										<Switch id="cleanupNewsletters" defaultChecked />
										<Label htmlFor="cleanupNewsletters" className="font-normal flex-1">Newsletters</Label>
									</div>
									<div className="flex items-center space-x-3 p-3 border rounded-md">
										<Switch id="cleanupPromotions" defaultChecked />
										<Label htmlFor="cleanupPromotions" className="font-normal flex-1">Promotions</Label>
									</div>
									<div className="flex items-center space-x-3 p-3 border rounded-md">
										<Switch id="cleanupSocial" />
										<Label htmlFor="cleanupSocial" className="font-normal flex-1">Social Updates</Label>
									</div>
								</div>
							</div>
							<div className="flex items-center justify-between p-3 border rounded-md">
								<div className="flex-1">
									<Label htmlFor="inboxHealthScoring" className="font-normal">Inbox Health Scoring</Label>
									<p className="text-xs text-muted-foreground">Show health indicators in dashboard.</p>
								</div>
								<Switch id="inboxHealthScoring" defaultChecked />
							</div>
							<div className="space-y-2 max-w-sm">
								<Label htmlFor="summaryTone">Language/Tone of Summaries</Label>
								<Select defaultValue="Friendly">
									<SelectTrigger id="summaryTone">
										<SelectValue placeholder="Select tone" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Formal">Formal</SelectItem>
										<SelectItem value="Friendly">Friendly</SelectItem>
										<SelectItem value="Minimalist">Minimalist</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
						<CardFooter>
							<Button>Save Cleanup Preferences</Button>
						</CardFooter>
					</Card>

					{/* Privacy and Data */}
					<Card id="privacy-data">
						<CardHeader>
							<CardTitle>Privacy and Data</CardTitle>
							<CardDescription>Manage your data and privacy settings.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Button variant="outline" className="w-full justify-start">
								<Download className="w-4 h-4 mr-2" />
								Export My Summaries (Download Data)
							</Button>
							<Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
								<AlertTriangle className="w-4 h-4 mr-2" />
								Request Complete Data Deletion
							</Button>
							<div>
								<Label className="text-base font-medium">Token Access Log</Label>
								<p className="text-sm text-muted-foreground mb-2">Recent access to Gmail API by Sumails will be shown here.</p>
								<div className="mt-2 p-4 bg-muted rounded-md text-sm border">
									<p className="text-muted-foreground">No recent access logs available (UI Placeholder).</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Account Management */}
					<Card id="account-management" className="border-destructive/50">
						<CardHeader>
							<CardTitle className="text-destructive">Account Management</CardTitle>
						</CardHeader>
						<CardContent>
							<Button variant="destructive" className="w-full justify-start">
								<Trash2 className="w-4 h-4 mr-2" />
								Delete My Sumails Account
							</Button>
							<p className="text-xs text-muted-foreground mt-2">This action is irreversible and will delete all your data associated with Sumails, including summaries and settings.</p>
						</CardContent>
					</Card>

				</div>
			</div>
		</ContentView>
	)
} 