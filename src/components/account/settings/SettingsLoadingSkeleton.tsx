import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoadingSkeleton() {
	return (
		<div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header Skeleton */}
				<div className="text-center space-y-2">
					<Skeleton className="h-9 w-64 mx-auto" />
					<Skeleton className="h-5 w-96 mx-auto" />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Settings Column */}
					<div className="lg:col-span-2 space-y-6">
						{/* Account Information Card Skeleton */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-40" />
								</div>
								<Skeleton className="h-4 w-48" />
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-12 w-full" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-12 w-full" />
								</div>
							</CardContent>
						</Card>

						{/* Summary Settings Card Skeleton */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-36" />
								</div>
								<Skeleton className="h-4 w-64" />
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Delivery Methods */}
								<div className="space-y-3">
									<Skeleton className="h-5 w-40" />
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<div className="space-y-1">
												<Skeleton className="h-4 w-12" />
												<Skeleton className="h-3 w-64" />
											</div>
											<Skeleton className="h-6 w-11" />
										</div>
										<div className="flex items-center justify-between">
											<div className="space-y-1">
												<Skeleton className="h-4 w-16" />
												<Skeleton className="h-3 w-56" />
											</div>
											<Skeleton className="h-6 w-11" />
										</div>
									</div>
								</div>

								{/* Timing Settings */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Skeleton className="h-4 w-28" />
										<Skeleton className="h-10 w-full" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-10 w-full" />
									</div>
								</div>

								{/* Tone Settings */}
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-10 w-full" />
								</div>
							</CardContent>
						</Card>

						{/* Subscription Card Skeleton */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-28" />
								</div>
								<Skeleton className="h-4 w-52" />
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-1">
										<Skeleton className="h-3 w-8" />
										<Skeleton className="h-6 w-12" />
									</div>
									<div className="space-y-1">
										<Skeleton className="h-3 w-12" />
										<Skeleton className="h-6 w-16" />
									</div>
								</div>
								<div className="space-y-1">
									<Skeleton className="h-3 w-20" />
									<Skeleton className="h-5 w-32" />
								</div>
								<div className="flex flex-col sm:flex-row gap-3">
									<Skeleton className="h-10 flex-1" />
									<Skeleton className="h-10 flex-1" />
								</div>
							</CardContent>
						</Card>

						{/* Notification Preferences Card Skeleton */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-44" />
								</div>
								<Skeleton className="h-4 w-60" />
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-64" />
									</div>
									<Skeleton className="h-6 w-11" />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Skeleton className="h-4 w-36" />
										<Skeleton className="h-3 w-56" />
									</div>
									<Skeleton className="h-6 w-11" />
								</div>
							</CardContent>
						</Card>

						{/* Account Deletion Card Skeleton */}
						<Card className="border-destructive/20">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-24" />
								</div>
								<Skeleton className="h-4 w-72" />
							</CardHeader>
							<CardContent>
								<div className="p-4 bg-destructive/5 border border-destructive/20 rounded-md space-y-4">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-10 w-36" />
								</div>
							</CardContent>
						</Card>

						{/* Save Button Skeleton */}
						<div className="flex justify-end">
							<Skeleton className="h-10 w-32" />
						</div>
					</div>

					{/* Sidebar Skeleton */}
					<div className="space-y-6">
						{/* Email Management Card Skeleton */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-36" />
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-8 w-full" />
							</CardContent>
						</Card>

						{/* Security Card Skeleton */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-20" />
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-8 w-full" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
} 