import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MailboxesLoadingSkeleton() {
	return (
		<div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header Skeleton */}
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-4 mb-2">
							<Skeleton className="h-8 w-32" />
						</div>
						<Skeleton className="h-9 w-48" />
						<Skeleton className="h-5 w-96 mt-2" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-10 w-32" />
						<Skeleton className="h-10 w-36" />
					</div>
				</div>

				{/* Summary Status Loading Skeleton */}
				<Card>
					<CardContent className="flex items-center justify-center py-8">
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-4" />
							<Skeleton className="h-4 w-48" />
						</div>
					</CardContent>
				</Card>

				{/* Connected Accounts List Skeleton */}
				<div className="space-y-4">
					{/* Account Card Skeleton 1 */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div>
										<Skeleton className="h-5 w-48" />
										<div className="flex items-center gap-2 mt-2">
											<Skeleton className="h-5 w-16" />
											<Skeleton className="h-5 w-20" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-16" />
									<Skeleton className="h-8 w-8" />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<Skeleton className="h-4 w-20 mb-1" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div>
									<Skeleton className="h-4 w-32 mb-1" />
									<Skeleton className="h-4 w-8" />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Account Card Skeleton 2 */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div>
										<Skeleton className="h-5 w-56" />
										<div className="flex items-center gap-2 mt-2">
											<Skeleton className="h-5 w-16" />
											<Skeleton className="h-5 w-24" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-16" />
									<Skeleton className="h-8 w-8" />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<Skeleton className="h-4 w-20 mb-1" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div>
									<Skeleton className="h-4 w-32 mb-1" />
									<Skeleton className="h-4 w-8" />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Account Card Skeleton 3 */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div>
										<Skeleton className="h-5 w-44" />
										<div className="flex items-center gap-2 mt-2">
											<Skeleton className="h-5 w-16" />
											<Skeleton className="h-5 w-18" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-16" />
									<Skeleton className="h-8 w-8" />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<Skeleton className="h-4 w-20 mb-1" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div>
									<Skeleton className="h-4 w-32 mb-1" />
									<Skeleton className="h-4 w-8" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Help Section Skeleton */}
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-4 w-64" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div className="p-3 bg-blue-50 rounded-lg border">
									<Skeleton className="h-5 w-36 mb-2" />
									<Skeleton className="h-12 w-full" />
								</div>
								<div className="p-3 bg-green-50 rounded-lg border">
									<Skeleton className="h-5 w-28 mb-2" />
									<Skeleton className="h-12 w-full" />
								</div>
								<div className="p-3 bg-purple-50 rounded-lg border">
									<Skeleton className="h-5 w-32 mb-2" />
									<Skeleton className="h-12 w-full" />
								</div>
							</div>
							
							<div className="h-px bg-border" />
							
							<div className="space-y-2 text-sm">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-5/6" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 