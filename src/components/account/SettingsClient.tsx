'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useSettings } from '@/hooks/use-settings'
import { settingsService } from '@/lib/services/settings'
import { FloatingSaveBar } from '@/components/ui/floating-save-bar'
import {
	AccountInformationCard,
	SummarySettingsCard,
	SubscriptionCard,
	NotificationPreferencesCard,
	AccountDeletionCard,
	EmailManagementCard,
	SecurityCard,
	SettingsLoadingSkeleton
} from './settings'

export default function SettingsClient() {
	const router = useRouter()
	const { authUser, isLoading: authLoading, isAuthenticated, signOut } = useAuth()
	const {
		settings,
		isLoading: settingsLoading,
		isSaving,
		hasChanges,
		updateNotifications,
		updateSummaryReceiveBy,
		updateSummarySetting,
		updateProfile,
		saveSettings,
		discardChanges,
	} = useSettings()

	const [subscriptionData, setSubscriptionData] = useState<{
		isSubscribed: boolean
		plan: string | null
		status: string | null
		renewsOn: string | null
		billingCycle: string | null
	}>({
		isSubscribed: false,
		plan: null,
		status: null,
		renewsOn: null,
		billingCycle: null,
	})
	const [isDeletingAccount, setIsDeletingAccount] = useState(false)

	// Redirect if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/auth/login')
		}
	}, [authLoading, isAuthenticated, router])

	// Load subscription data
	useEffect(() => {
		if (!authUser?.id) return

		const loadSubscriptionData = async () => {
			try {
				const data = await settingsService.getSubscriptionData(authUser.id)
				setSubscriptionData(data)
			} catch (error) {
				console.error('Failed to load subscription data:', error)
			}
		}

		loadSubscriptionData()
	}, [authUser?.id])

	const handleManageSubscription = () => {
		// TODO: Integrate with subscription service (Stripe, etc.)
		toast.info('Redirecting to subscription management...')
	}

	const handleCancelSubscription = () => {
		// TODO: Implement subscription cancellation
		toast.info('Subscription cancellation flow...')
	}

	const handleDeleteAccount = async () => {
		if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your data.')) {
			return
		}

		try {
			setIsDeletingAccount(true)
			// TODO: Implement actual account deletion
			await new Promise(resolve => setTimeout(resolve, 2000))
			toast.success('Account deletion initiated. You will be logged out shortly.')
			// TODO: Sign out user and redirect
		} catch (error) {
			toast.error('Failed to delete account. Please try again.')
		} finally {
			setIsDeletingAccount(false)
		}
	}

	const handleLogout = async () => {
		try {
			await signOut()
			toast.success('Successfully logged out')
			router.push('/auth/login')
		} catch (error) {
			console.error('Logout error:', error)
			toast.error('Failed to log out. Please try again.')
		}
	}

	if (authLoading || settingsLoading) {
		return <SettingsLoadingSkeleton />
	}

	if (!isAuthenticated || !settings) {
		return null // Will redirect in useEffect
	}

	return (
		<>
			<div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 pb-24">
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
							<AccountInformationCard email={authUser?.email} />

							{/* Summary Settings */}
							<SummarySettingsCard
								settings={settings.summarySettings}
								onReceiveByChange={updateSummaryReceiveBy}
								onSettingChange={updateSummarySetting}
							/>

							{/* Subscription Card - Only show if subscribed */}
							{subscriptionData.isSubscribed && 
							 subscriptionData.plan && 
							 subscriptionData.status && 
							 subscriptionData.renewsOn && 
							 subscriptionData.billingCycle && (
								<SubscriptionCard
									subscriptionData={{
										isSubscribed: subscriptionData.isSubscribed,
										plan: subscriptionData.plan,
										status: subscriptionData.status,
										renewsOn: subscriptionData.renewsOn,
										billingCycle: subscriptionData.billingCycle,
									}}
									onManageSubscription={handleManageSubscription}
									onCancelSubscription={handleCancelSubscription}
								/>
							)}

							{/* Notification Preferences */}
							<NotificationPreferencesCard
								notifications={settings.notifications}
								onNotificationChange={updateNotifications}
							/>

							{/* Account Deletion */}
							<AccountDeletionCard
								onDeleteAccount={handleDeleteAccount}
								isDeletingAccount={isDeletingAccount}
							/>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Email Management */}
							<EmailManagementCard />

							{/* Security */}
							<SecurityCard />

							{/* Logout */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg font-semibold">Sign Out</CardTitle>
									<CardDescription>
										Sign out of your account on this device
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button
										variant="outline"
										onClick={handleLogout}
										className="w-full flex items-center justify-center space-x-2 text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<LogOut className="h-4 w-4" />
										<span>Sign Out</span>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>

			{/* Floating Save Bar */}
			<FloatingSaveBar
				isVisible={hasChanges}
				isSaving={isSaving}
				onSave={saveSettings}
				onDiscard={discardChanges}
			/>
		</>
	)
} 