import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { settingsService, SettingsData } from '@/lib/services/settings'
import { useAuth } from '@/contexts/auth-context'

export function useSettings() {
	const { authUser } = useAuth()
	const [settings, setSettings] = useState<SettingsData | null>(null)
	const [originalSettings, setOriginalSettings] = useState<SettingsData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	// Load settings on mount
	useEffect(() => {
		if (!authUser?.id) return

		const loadSettings = async () => {
			try {
				setIsLoading(true)
				const data = await settingsService.getUserSettings(authUser.id)
				if (data) {
					setSettings(data)
					setOriginalSettings(JSON.parse(JSON.stringify(data))) // Deep copy
				}
			} catch (error) {
				console.error('Failed to load settings:', error)
				toast.error('Failed to load settings')
			} finally {
				setIsLoading(false)
			}
		}

		loadSettings()
	}, [authUser?.id])

	// Check for changes whenever settings change
	useEffect(() => {
		if (!settings || !originalSettings) {
			setHasChanges(false)
			return
		}

		const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings)
		setHasChanges(hasChanged)
	}, [settings, originalSettings])

	const updateNotifications = useCallback((key: keyof SettingsData['notifications']) => {
		if (!settings) return

		setSettings(prev => {
			if (!prev) return prev
			return {
				...prev,
				notifications: {
					...prev.notifications,
					[key]: !prev.notifications[key]
				}
			}
		})
	}, [settings])

	const updateSummaryReceiveBy = useCallback((key: keyof SettingsData['summarySettings']['receiveBy']) => {
		if (!settings) return

		setSettings(prev => {
			if (!prev) return prev
			return {
				...prev,
				summarySettings: {
					...prev.summarySettings,
					receiveBy: {
						...prev.summarySettings.receiveBy,
						[key]: !prev.summarySettings.receiveBy[key]
					}
				}
			}
		})
	}, [settings])

	const updateSummarySetting = useCallback((key: keyof Omit<SettingsData['summarySettings'], 'receiveBy'>, value: string) => {
		if (!settings) return

		setSettings(prev => {
			if (!prev) return prev
			return {
				...prev,
				summarySettings: {
					...prev.summarySettings,
					[key]: value
				}
			}
		})
	}, [settings])

	const updateProfile = useCallback((key: keyof SettingsData['profile'], value: string | null) => {
		if (!settings) return

		setSettings(prev => {
			if (!prev) return prev
			return {
				...prev,
				profile: {
					...prev.profile,
					[key]: value
				}
			}
		})
	}, [settings])

	const saveSettings = useCallback(async () => {
		if (!authUser?.id || !settings || !hasChanges) return

		try {
			setIsSaving(true)
			await settingsService.updateUserSettings(authUser.id, settings)
			setOriginalSettings(JSON.parse(JSON.stringify(settings))) // Update original to current
			setHasChanges(false)
			toast.success('Settings saved successfully!')
		} catch (error) {
			console.error('Failed to save settings:', error)
			toast.error('Failed to save settings. Please try again.')
		} finally {
			setIsSaving(false)
		}
	}, [authUser?.id, settings, hasChanges])

	const discardChanges = useCallback(() => {
		if (originalSettings) {
			setSettings(JSON.parse(JSON.stringify(originalSettings)))
			setHasChanges(false)
		}
	}, [originalSettings])

	return {
		settings,
		isLoading,
		isSaving,
		hasChanges,
		updateNotifications,
		updateSummaryReceiveBy,
		updateSummarySetting,
		updateProfile,
		saveSettings,
		discardChanges,
	}
} 