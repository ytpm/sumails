'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useSettings } from '@/hooks/use-settings'
import { FloatingSaveBar } from '@/components/ui/floating-save-bar'
import {
	AccountInformationCard,
	SummarySettingsCard,
	SubscriptionCard,
	NotificationPreferencesCard,
	AccountDeletionCard,
	EmailManagementCard,
	SecurityCard,
	LogoutCard,
	SettingsLoadingSkeleton
} from './settings'

export default function SettingsClient() {
	const router = useRouter()
	const { 
		authUser, 
		isLoading: authLoading, 
		isAuthenticated, 
		userSubscription,
		isSubscriptionLoading,
		signOut 
	} = useAuth()
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

	const [isDeletingAccount, setIsDeletingAccount] = useState(false)
	const [hasInitialized, setHasInitialized] = useState(false)

	// Track when we've successfully loaded once
	useEffect(() => {
		if (!authLoading && isAuthenticated && settings) {
			setHasInitialized(true)
		}
	}, [authLoading, isAuthenticated, settings])

	// Redirect if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/auth/login')
		}
	}, [authLoading, isAuthenticated, router])

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

	// Show loading skeleton only on initial load or when actually loading
	const shouldShowSkeleton = (
		(authLoading && !hasInitialized) || 
		(isAuthenticated && settingsLoading && !hasInitialized) || 
		(isSubscriptionLoading && !hasInitialized)
	)

	if (shouldShowSkeleton) {
		return <SettingsLoadingSkeleton />
	}

	if (!isAuthenticated) {
		return null // Will redirect in useEffect
	}

	// If authenticated but no settings yet and we haven't initialized, show skeleton
	if (isAuthenticated && !settings && !hasInitialized) {
		return <SettingsLoadingSkeleton />
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
								settings={settings!.summarySettings}
								whatsappPhone={settings!.profile.whatsappNumber}
								onReceiveByChange={updateSummaryReceiveBy}
								onSettingChange={updateSummarySetting}
								onProfileChange={updateProfile}
							/>

							{/* Subscription Card - Only show if subscribed */}
							{userSubscription && (
								<SubscriptionCard
									subscriptionData={userSubscription}
									onManageSubscription={handleManageSubscription}
									onCancelSubscription={handleCancelSubscription}
								/>
							)}

							{/* Notification Preferences */}
							<NotificationPreferencesCard
								notifications={settings!.notifications}
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
							<LogoutCard onLogout={handleLogout} />
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