'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { User, Mail, Bell, Shield, ExternalLink } from 'lucide-react'

export default function SettingsClient() {
	const router = useRouter()
	const { authUser, isLoading, isAuthenticated } = useAuth()
	const [notifications, setNotifications] = useState({
		emailDigests: true,
		securityAlerts: true,
		productUpdates: false,
		marketingEmails: false,
	})
	const [isSaving, setIsSaving] = useState(false)

	// Redirect if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/auth/login')
		}
	}, [isLoading, isAuthenticated, router])

	const handleNotificationChange = (key: keyof typeof notifications) => {
		setNotifications(prev => ({
			...prev,
			[key]: !prev[key]
		}))
	}

	const handleSaveSettings = async () => {
		try {
			setIsSaving(true)
			// TODO: Implement actual settings save to Supabase
			// For now, just simulate a save
			await new Promise(resolve => setTimeout(resolve, 1000))
			toast.success('Settings saved successfully!')
		} catch (error) {
			toast.error('Failed to save settings. Please try again.')
		} finally {
			setIsSaving(false)
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
				<div className="text-center">
					<h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
					<p className="text-muted-foreground mt-2">
						Manage your account preferences and connected services
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Settings */}
					<div className="lg:col-span-2 space-y-6">
						{/* Account Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Account Information
								</CardTitle>
								<CardDescription>
									Your basic account details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="email">Email Address</Label>
									<div className="mt-1 p-3 bg-muted rounded-md">
										<p className="text-sm text-muted-foreground">
											{authUser?.email || 'No email available'}
										</p>
									</div>
								</div>
								<div>
									<Label>Account Status</Label>
									<div className="mt-1 p-3 bg-muted rounded-md">
										<p className="text-sm text-green-600 font-medium">
											✓ Verified
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Notification Preferences */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Bell className="h-5 w-5" />
									Notification Preferences
								</CardTitle>
								<CardDescription>
									Choose what notifications you'd like to receive
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="email-digests">Email Digests</Label>
										<p className="text-sm text-muted-foreground">
											Receive daily summaries of your emails
										</p>
									</div>
									<Switch
										id="email-digests"
										checked={notifications.emailDigests}
										onCheckedChange={() => handleNotificationChange('emailDigests')}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="security-alerts">Security Alerts</Label>
										<p className="text-sm text-muted-foreground">
											Important security notifications
										</p>
									</div>
									<Switch
										id="security-alerts"
										checked={notifications.securityAlerts}
										onCheckedChange={() => handleNotificationChange('securityAlerts')}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="product-updates">Product Updates</Label>
										<p className="text-sm text-muted-foreground">
											News about new features and improvements
										</p>
									</div>
									<Switch
										id="product-updates"
										checked={notifications.productUpdates}
										onCheckedChange={() => handleNotificationChange('productUpdates')}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="marketing-emails">Marketing Emails</Label>
										<p className="text-sm text-muted-foreground">
											Tips, tutorials, and promotional content
										</p>
									</div>
									<Switch
										id="marketing-emails"
										checked={notifications.marketingEmails}
										onCheckedChange={() => handleNotificationChange('marketingEmails')}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Save Button */}
						<div className="flex justify-end">
							<Button 
								onClick={handleSaveSettings}
								disabled={isSaving}
								className="min-w-[120px]"
							>
								{isSaving ? 'Saving...' : 'Save Settings'}
							</Button>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Mail className="h-5 w-5" />
									Email Management
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link href="/account/mailboxes">
									<Button variant="outline" className="w-full justify-between">
										Mailboxes
										<ExternalLink className="h-4 w-4" />
									</Button>
								</Link>
								<p className="text-xs text-muted-foreground">
									Manage your connected email mailboxes and view summaries
								</p>
							</CardContent>
						</Card>

						{/* Security */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="h-5 w-5" />
									Security
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link href="/auth/update-password">
									<Button variant="outline" className="w-full justify-between">
										Change Password
										<ExternalLink className="h-4 w-4" />
									</Button>
								</Link>
								<p className="text-xs text-muted-foreground">
									Update your account password for better security
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
} 