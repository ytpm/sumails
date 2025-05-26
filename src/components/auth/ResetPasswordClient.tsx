'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { ResetPasswordSchema, type ResetPasswordSchemaType } from '@/schema/auth-schemas'

export default function ResetPasswordClient() {
	const { sendPasswordResetEmail, isLoading } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [emailSent, setEmailSent] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
	} = useForm<ResetPasswordSchemaType>({
		resolver: zodResolver(ResetPasswordSchema),
	})

	const onSubmit = async (data: ResetPasswordSchemaType) => {
		try {
			setIsSubmitting(true)

			const { error: authError } = await sendPasswordResetEmail(data)

			if (authError) {
				toast.error(authError.message)
			} else {
				setEmailSent(true)
				toast.success('Password reset email sent! Please check your inbox.')
			}
		} catch (err) {
			toast.error('An unexpected error occurred. Please try again.')
		} finally {
			setIsSubmitting(false)
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

	if (emailSent) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="text-2xl font-bold">Check your email</CardTitle>
							<CardDescription>
								We've sent a password reset link to {getValues('email')}
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Click the link in the email to reset your password. If you don't see the email, check your spam folder.
							</p>
							<div className="space-y-2">
								<Button
									onClick={() => setEmailSent(false)}
									variant="outline"
									className="w-full"
								>
									Send another email
								</Button>
								<Link href="/auth/login">
									<Button variant="ghost" className="w-full">
										Back to sign in
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
						<CardDescription>
							Enter your email address and we'll send you a link to reset your password
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="Enter your email"
									{...register('email')}
									className={errors.email ? 'border-destructive' : ''}
								/>
								{errors.email && (
									<p className="text-sm text-destructive">{errors.email.message}</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Sending...' : 'Send reset link'}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<Link href="/auth/login" className="text-sm text-primary hover:underline">
								Back to sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 