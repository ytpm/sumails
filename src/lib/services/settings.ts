import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'
import { validateSettingsUpdate } from '@/schema/settings'

type UserSettings = Database['public']['Tables']['user_settings']['Row']
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']
type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

export interface SettingsData {
	notifications: {
		productUpdates: boolean
		marketingEmails: boolean
	}
	summarySettings: {
		receiveBy: {
			email: boolean
			whatsapp: boolean
		}
		preferredTime: string
		timezone: string
		language: string
	}
	profile: {
		fullName: string | null
		phoneNumber: string | null
		whatsappNumber: string | null
	}
}

class SettingsService {
	private supabase = createClient()

	async getUserSettings(userId: string): Promise<SettingsData | null> {
		try {
			// Fetch user settings
			const { data: userSettings, error: settingsError } = await this.supabase
				.from('user_settings')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (settingsError && settingsError.code !== 'PGRST116') {
				throw settingsError
			}

			// Fetch profile data
			const { data: profile, error: profileError } = await this.supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single()

			if (profileError && profileError.code !== 'PGRST116') {
				throw profileError
			}

			// Return structured data with defaults
			return {
				notifications: {
					productUpdates: userSettings?.notifications_product_updates ?? false,
					marketingEmails: userSettings?.notifications_marketing_emails ?? false,
				},
				summarySettings: {
					receiveBy: {
						email: userSettings?.summary_receive_by_email ?? true,
						whatsapp: userSettings?.summary_receive_by_whatsapp ?? false,
					},
					preferredTime: userSettings?.summary_preferred_time ?? '09:00',
					timezone: userSettings?.summary_timezone ?? 'UTC',
					language: userSettings?.summary_language ?? 'friendly',
				},
				profile: {
					fullName: profile?.full_name ?? null,
					phoneNumber: profile?.phone_number ?? null,
					whatsappNumber: profile?.whatsapp_number ?? null,
				},
			}
		} catch (error) {
			console.error('Error fetching user settings:', error)
			throw error
		}
	}

	async updateUserSettings(userId: string, settings: Partial<SettingsData>): Promise<void> {
		try {
			// Validate settings data
			const validation = validateSettingsUpdate(settings)
			if (!validation.success) {
				throw new Error(`Invalid settings data: ${validation.error.message}`)
			}

			// Update user_settings table
			if (settings.notifications || settings.summarySettings) {
				const userSettingsUpdate: UserSettingsUpdate = {}

				if (settings.notifications) {
					userSettingsUpdate.notifications_product_updates = settings.notifications.productUpdates
					userSettingsUpdate.notifications_marketing_emails = settings.notifications.marketingEmails
				}

				if (settings.summarySettings) {
					if (settings.summarySettings.receiveBy) {
						userSettingsUpdate.summary_receive_by_email = settings.summarySettings.receiveBy.email
						userSettingsUpdate.summary_receive_by_whatsapp = settings.summarySettings.receiveBy.whatsapp
					}
					userSettingsUpdate.summary_preferred_time = settings.summarySettings.preferredTime
					userSettingsUpdate.summary_timezone = settings.summarySettings.timezone
					userSettingsUpdate.summary_language = settings.summarySettings.language
				}

				userSettingsUpdate.updated_at = new Date().toISOString()

				// Check if user_settings record exists
				const { data: existingSettings } = await this.supabase
					.from('user_settings')
					.select('id')
					.eq('user_id', userId)
					.single()

				if (existingSettings) {
					// Update existing record
					const { error } = await this.supabase
						.from('user_settings')
						.update(userSettingsUpdate)
						.eq('user_id', userId)

					if (error) throw error
				} else {
					// Insert new record
					const userSettingsInsert: UserSettingsInsert = {
						user_id: userId,
						...userSettingsUpdate,
					}

					const { error } = await this.supabase
						.from('user_settings')
						.insert(userSettingsInsert)

					if (error) throw error
				}
			}

			// Update profiles table
			if (settings.profile) {
				const profileUpdate: ProfileUpdate = {
					full_name: settings.profile.fullName,
					phone_number: settings.profile.phoneNumber,
					whatsapp_number: settings.profile.whatsappNumber,
					updated_at: new Date().toISOString(),
				}

				const { error } = await this.supabase
					.from('profiles')
					.upsert({
						id: userId,
						...profileUpdate,
					})

				if (error) throw error
			}
		} catch (error) {
			console.error('Error updating user settings:', error)
			throw error
		}
	}

	async getSubscriptionData(userId: string): Promise<Subscription | null> {
		try {
			const { data: subscription, error } = await this.supabase
				.from('subscriptions')
				.select('*')
				.eq('user_id', userId)
				.eq('status', 'active')
				.single()

			if (error && error.code !== 'PGRST116') {
				throw error
			}

			return subscription
		} catch (error) {
			console.error('Error fetching subscription data:', error)
			throw error
		}
	}
}

export const settingsService = new SettingsService() 