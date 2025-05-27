import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { settingsService, SettingsData } from '@/lib/services/settings'
import { useAuth } from '@/hooks/use-auth'

export function useSettings() {
	const { authUser, isLoading: authLoading } = useAuth()
	const [settings, setSettings] = useState<SettingsData | null>(null)
	const [originalSettings, setOriginalSettings] = useState<SettingsData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)
	const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const lastAuthUserIdRef = useRef<string | null>(null)

	// Load settings on mount
	useEffect(() => {
		// Clear any existing timeout
		if (loadingTimeoutRef.current) {
			clearTimeout(loadingTimeoutRef.current)
		}

		// If no auth user, set loading to false immediately
		if (!authUser?.id) {
			setIsLoading(false)
			setIsInitialized(true)
			return
		}

		// If this is the same user and we already have settings, don't reload
		if (lastAuthUserIdRef.current === authUser.id && settings && isInitialized) {
			return
		}

		const loadSettings = async () => {
			try {
				// Only show loading if we don't have settings yet or user changed
				if (!settings || lastAuthUserIdRef.current !== authUser.id) {
					setIsLoading(true)
				}
				
				const data = await settingsService.getUserSettings(authUser.id)
				if (data) {
					setSettings(data)
					setOriginalSettings(JSON.parse(JSON.stringify(data))) // Deep copy
				}
				lastAuthUserIdRef.current = authUser.id
			} catch (error) {
				console.error('Failed to load settings:', error)
				toast.error('Failed to load settings')
			} finally {
				// Use a small delay to prevent flashing
				loadingTimeoutRef.current = setTimeout(() => {
					setIsLoading(false)
					setIsInitialized(true)
				}, 100)
			}
		}

		loadSettings()

		// Cleanup timeout on unmount
		return () => {
			if (loadingTimeoutRef.current) {
				clearTimeout(loadingTimeoutRef.current)
			}
		}
	}, [authUser?.id, authLoading])

	// Handle browser visibility changes
	useEffect(() => {
		const handleVisibilityChange = () => {
			// When tab becomes visible again, don't reload if we already have data
			if (!document.hidden && settings && authUser?.id) {
				// Just ensure loading is false
				setIsLoading(false)
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [settings, authUser?.id])

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