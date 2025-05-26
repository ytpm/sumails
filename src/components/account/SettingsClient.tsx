'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
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
	const { authUser, isLoading, isAuthenticated } = useAuth()
	const [notifications, setNotifications] = useState({
		productUpdates: false,
		marketingEmails: false,
	})
	const [summarySettings, setSummarySettings] = useState({
		receiveBy: {
			email: true,
			whatsapp: false,
		},
		preferredTime: '09:00',
		timezone: 'UTC',
		language: 'friendly',
	})
	const [subscriptionData, setSubscriptionData] = useState({
		isSubscribed: true, // TODO: Get from actual subscription service
		plan: 'Pro',
		status: 'active',
		renewsOn: '2024-02-15',
		billingCycle: 'monthly',
	})
	const [isSaving, setIsSaving] = useState(false)
	const [isDeletingAccount, setIsDeletingAccount] = useState(false)

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

	const handleSummaryReceiveByChange = (key: keyof typeof summarySettings.receiveBy) => {
		setSummarySettings(prev => ({
			...prev,
			receiveBy: {
				...prev.receiveBy,
				[key]: !prev.receiveBy[key]
			}
		}))
	}

	const handleSummarySettingChange = (key: keyof Omit<typeof summarySettings, 'receiveBy'>, value: string) => {
		setSummarySettings(prev => ({
			...prev,
			[key]: value
		}))
	}

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

	const handleSaveSettings = async () => {
		try {
			setIsSaving(true)
			// TODO: Implement actual settings save to Supabase
			// Include notifications and summarySettings in the save
			console.log('Saving settings:', { notifications, summarySettings })
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
		return <SettingsLoadingSkeleton />
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
						<AccountInformationCard email={authUser?.email} />

						{/* Summary Settings */}
						<SummarySettingsCard
							settings={summarySettings}
							onReceiveByChange={handleSummaryReceiveByChange}
							onSettingChange={handleSummarySettingChange}
						/>

						{/* Subscription Card - Only show if subscribed */}
						<SubscriptionCard
							subscriptionData={subscriptionData}
							onManageSubscription={handleManageSubscription}
							onCancelSubscription={handleCancelSubscription}
						/>

						{/* Notification Preferences */}
						<NotificationPreferencesCard
							notifications={notifications}
							onNotificationChange={handleNotificationChange}
						/>

						{/* Account Deletion */}
						<AccountDeletionCard
							onDeleteAccount={handleDeleteAccount}
							isDeletingAccount={isDeletingAccount}
						/>

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
						{/* Email Management */}
						<EmailManagementCard />

						{/* Security */}
						<SecurityCard />
					</div>
				</div>
			</div>
		</div>
	)
} 