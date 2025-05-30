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
		personalContext: string | null
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
					personalContext: profile?.personal_context ?? null,
				},
			}
		} catch (error) {
			console.error('Error fetching user settings:', error)
			throw error
		}
	}

	async updateUserSettings(userId: string, settings: Partial<SettingsData>): Promise<void> {
		try {
			// Filter out undefined values to prevent validation errors
			const cleanSettings = JSON.parse(JSON.stringify(settings, (key, value) => {
				return value === undefined ? undefined : value;
			}));

			// Remove undefined summary settings fields
			if (cleanSettings.summarySettings) {
				Object.keys(cleanSettings.summarySettings).forEach(key => {
					if (cleanSettings.summarySettings[key] === undefined) {
						delete cleanSettings.summarySettings[key];
					}
				});

				// Fix preferredTime format - strip seconds if present (HH:MM:SS -> HH:MM)
				if (cleanSettings.summarySettings.preferredTime) {
					const timeValue = cleanSettings.summarySettings.preferredTime;
					if (timeValue.length === 8 && timeValue.includes(':')) {
						// Convert "09:00:00" to "09:00"
						cleanSettings.summarySettings.preferredTime = timeValue.substring(0, 5);
						console.log('⏰ Fixed preferredTime format:', `"${timeValue}" -> "${cleanSettings.summarySettings.preferredTime}"`);
					}
				}
			}

			console.log('🔍 Validating settings data:', JSON.stringify(cleanSettings, null, 2))

			// Debug the preferredTime specifically
			if (cleanSettings.summarySettings?.preferredTime) {
				console.log('⏰ PreferredTime value:', `"${cleanSettings.summarySettings.preferredTime}"`)
				console.log('⏰ PreferredTime type:', typeof cleanSettings.summarySettings.preferredTime)
				console.log('⏰ PreferredTime length:', cleanSettings.summarySettings.preferredTime.length)
				
				// Test the regex manually
				const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
				const isValid = timeRegex.test(cleanSettings.summarySettings.preferredTime)
				console.log('⏰ Regex test result:', isValid)
			}

			// Validate settings data
			const validation = validateSettingsUpdate(cleanSettings)
			if (!validation.success) {
				console.error('❌ Validation failed:', validation.error)
				throw new Error(`Invalid settings data: ${JSON.stringify(validation.error.errors)}`)
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
					if (settings.summarySettings.preferredTime !== undefined) {
						userSettingsUpdate.summary_preferred_time = settings.summarySettings.preferredTime
					}
					if (settings.summarySettings.timezone !== undefined) {
						userSettingsUpdate.summary_timezone = settings.summarySettings.timezone
					}
					if (settings.summarySettings.language !== undefined) {
						userSettingsUpdate.summary_language = settings.summarySettings.language
					}
				}

				userSettingsUpdate.updated_at = new Date().toISOString()

				console.log('📤 Updating user settings:', userSettingsUpdate)

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
					personal_context: settings.profile.personalContext,
					updated_at: new Date().toISOString(),
				}

				// Use update instead of upsert since profiles should already exist
				const { error } = await this.supabase
					.from('profiles')
					.update(profileUpdate)
					.eq('id', userId)

				if (error) throw error
			}
		} catch (error) {
			console.error('Error updating user settings:', error)
			throw error
		}
	}

	async getSubscriptionData(userId: string): Promise<Subscription | null> {
		try {
			console.log(`🔍 Fetching subscription data for user: ${userId}`)
			
			const { data: subscriptions, error } = await this.supabase
				.from('subscriptions')
				.select('*')
				.eq('user_id', userId)
				.eq('status', 'active')
				.limit(1)

			if (error) {
				console.error('❌ Supabase subscription query error:', {
					code: error.code,
					message: error.message,
					details: error.details,
					hint: error.hint
				})
				
				// PGRST301 means table doesn't exist or access denied
				if (error.code === 'PGRST301') {
					console.warn('⚠️ Subscriptions table does not exist or access is denied. User will be treated as free tier.')
					return null
				}
				
				// For other errors, log and return null to gracefully degrade to free tier
				console.warn('⚠️ Subscription query failed, treating user as free tier:', error)
				return null
			}

			// Check if any subscriptions were found
			if (!subscriptions || subscriptions.length === 0) {
				console.log('ℹ️ No active subscription found for user (free tier)')
				return null
			}

			console.log('✅ Active subscription found for user')
			return subscriptions[0]
		} catch (error) {
			console.error('❌ Error fetching subscription data:', error)
			// Return null to gracefully degrade to free tier instead of throwing
			return null
		}
	}
}

export const settingsService = new SettingsService() 