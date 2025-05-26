'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { SignupSchema, type SignupSchemaType } from '@/schema/auth-schemas'

export default function SignupClient() {
	const router = useRouter()
	const { signUp, isLoading } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupSchemaType>({
		resolver: zodResolver(SignupSchema),
	})

	const onSubmit = async (data: SignupSchemaType) => {
		try {
			setIsSubmitting(true)

			const { error: authError } = await signUp(data)

			if (authError) {
				toast.error(authError.message)
			} else {
				toast.success('Account created! Please check your email to verify your account.')
				router.push('/auth/check-email')
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

	return (
		<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">Create your account</CardTitle>
						<CardDescription>
							Get started with Sumails today
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

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Create a password"
									{...register('password')}
									className={errors.password ? 'border-destructive' : ''}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">{errors.password.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Confirm your password"
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
								{isSubmitting ? 'Creating account...' : 'Create account'}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-muted-foreground">
								Already have an account?{' '}
								<Link href="/auth/login" className="text-primary hover:underline">
									Sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 