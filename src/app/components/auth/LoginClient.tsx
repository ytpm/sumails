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
import { LoginSchema, type LoginSchemaType } from '@/schema/auth-schemas'

export default function LoginClient() {
	const router = useRouter()
	const { signInWithPassword, isLoading } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginSchemaType>({
		resolver: zodResolver(LoginSchema),
	})

	const onSubmit = async (data: LoginSchemaType) => {
		try {
			setIsSubmitting(true)

			const { error: authError } = await signInWithPassword(data)

			if (authError) {
				toast.error(authError.message)
			} else {
				toast.success('Successfully signed in!')
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

	return (
		<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
						<CardDescription>
							Sign in to your Sumails account
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
									placeholder="Enter your password"
									{...register('password')}
									className={errors.password ? 'border-destructive' : ''}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">{errors.password.message}</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Signing in...' : 'Sign in'}
							</Button>
						</form>

						<div className="mt-6 text-center space-y-2">
							<Link
								href="/auth/reset-password"
								className="text-sm text-primary hover:underline"
							>
								Forgot your password?
							</Link>
							<p className="text-sm text-muted-foreground">
								Don't have an account?{' '}
								<Link href="/auth/signup" className="text-primary hover:underline">
									Sign up
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 