import { z } from 'zod'

// Login Schema
export const LoginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters')
})

// Signup Schema
export const SignupSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters'),
	confirmPassword: z
		.string()
		.min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
})

// Reset Password Schema
export const ResetPasswordSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
})

// Update Password Schema
export const UpdatePasswordSchema = z.object({
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters'),
	confirmPassword: z
		.string()
		.min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
})

// Type exports
export type LoginSchemaType = z.infer<typeof LoginSchema>
export type SignupSchemaType = z.infer<typeof SignupSchema>
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>
export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema> 