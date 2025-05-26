import { z } from 'zod'

export const settingsSchema = z.object({
	notifications: z.object({
		productUpdates: z.boolean(),
		marketingEmails: z.boolean(),
	}),
	summarySettings: z.object({
		receiveBy: z.object({
			email: z.boolean(),
			whatsapp: z.boolean(),
		}),
		preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
		timezone: z.string().min(1, 'Timezone is required'),
		language: z.enum(['friendly', 'professional', 'concise'], {
			errorMap: () => ({ message: 'Language must be friendly, professional, or concise' })
		}),
	}),
	profile: z.object({
		fullName: z.string().nullable(),
		phoneNumber: z.string().nullable(),
		whatsappNumber: z.string().nullable(),
	}),
})

export type SettingsFormData = z.infer<typeof settingsSchema>

// Validation function for partial updates
export const validateSettingsUpdate = (data: unknown) => {
	return settingsSchema.partial().safeParse(data)
} 