'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { UpdatePasswordSchema, type UpdatePasswordSchemaType } from '@/schema/auth-schemas'

export default function UpdatePasswordClient() {
	const router = useRouter()
	const { updatePassword, isLoading, isAuthenticated } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdatePasswordSchemaType>({
		resolver: zodResolver(UpdatePasswordSchema),
	})

	// Redirect if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/auth/login')
		}
	}, [isLoading, isAuthenticated, router])

	const onSubmit = async (data: UpdatePasswordSchemaType) => {
		try {
			setIsSubmitting(true)

			const { error: authError } = await updatePassword(data)

			if (authError) {
				toast.error(authError.message)
			} else {
				toast.success('Password updated successfully!')
				router.push('/account/settings')
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

	if (!isAuthenticated) {
		return null // Will redirect in useEffect
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">Update your password</CardTitle>
						<CardDescription>
							Enter your new password below
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="password">New Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your new password"
									{...register('password')}
									className={errors.password ? 'border-destructive' : ''}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">{errors.password.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm New Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Confirm your new password"
									{...register('confirmPassword')}
									className={errors.confirmPassword ? 'border-destructive' : ''}
								/>
								{errors.confirmPassword && (
									<p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Updating...' : 'Update password'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 