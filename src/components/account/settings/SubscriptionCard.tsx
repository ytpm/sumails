import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Crown } from 'lucide-react'
import type { Subscription } from '@/contexts/auth-context'
import { plans } from '@/data/subscription-plans'

interface SubscriptionCardProps {
	subscriptionData: Subscription | null
	onManageSubscription: () => void
	onCancelSubscription: () => void
	onUpgrade?: () => void
}

export default function SubscriptionCard({ 
	subscriptionData, 
	onManageSubscription, 
	onCancelSubscription,
	onUpgrade
}: SubscriptionCardProps) {
	// Check if user has an active subscription
	const hasActiveSubscription = subscriptionData && subscriptionData.status === 'active'
	
	// Get free plan data from subscription plans
	const freePlan = plans.find(plan => plan.conceptualId === 'free')
	const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'
	const freePlanConfig = freePlan?.environments[currentEnv]
	
	// Free plan fallback data using actual plan configuration
	const freePlanData = {
		plan_name: freePlanConfig?.nickname || freePlan?.name || 'Free Plan',
		status: 'active',
		current_period_end: null
	}
	
	// Use subscription data if available, otherwise use free plan data
	const displayData = hasActiveSubscription ? subscriptionData : freePlanData
	const isFreeUser = !hasActiveSubscription

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{isFreeUser ? (
						<Crown className="h-5 w-5 text-amber-500" />
					) : (
						<CreditCard className="h-5 w-5" />
					)}
					Subscription
				</CardTitle>
				<CardDescription>
					{isFreeUser 
						? 'You are currently on the free plan'
						: 'Manage your subscription and billing'
					}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Plan</Label>
						<p className="text-lg font-semibold">{displayData.plan_name}</p>
					</div>
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Status</Label>
						<p className={`text-lg font-semibold capitalize ${
							isFreeUser ? 'text-amber-600' : 'text-green-600'
						}`}>
							{displayData.status}
						</p>
					</div>
				</div>
				
				{!isFreeUser && displayData.current_period_end && (
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Renews on</Label>
						<p className="text-base">
							{new Date(displayData.current_period_end).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</p>
					</div>
				)}

				{isFreeUser && freePlan && (
					<div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
						<div className="space-y-3">
							<p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
								Current plan includes:
							</p>
							<ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
								{freePlan.features.slice(0, 3).map((feature, index) => (
									<li key={index} className="flex items-center gap-2">
										<span className="w-1 h-1 bg-amber-600 dark:bg-amber-400 rounded-full"></span>
										{feature}
									</li>
								))}
							</ul>
							<p className="text-sm text-amber-800 dark:text-amber-200">
								Upgrade to unlock premium features like multiple account connections, 
								advanced AI summaries, and extended history.
							</p>
						</div>
					</div>
				)}

				<Separator />

				<div className="flex flex-col sm:flex-row gap-3">
					{isFreeUser ? (
						<>
							<Button 
								onClick={onUpgrade}
								className="flex-1"
							>
								Upgrade Plan
							</Button>
							<Button 
								variant="outline" 
								onClick={onManageSubscription}
								className="flex-1"
							>
								View Plans
							</Button>
						</>
					) : (
						<>
							<Button 
								variant="outline" 
								onClick={onManageSubscription}
								className="flex-1"
							>
								Manage Subscription
							</Button>
							<Button 
								variant="outline" 
								onClick={onCancelSubscription}
								className="flex-1 text-destructive hover:text-destructive"
							>
								Cancel Subscription
							</Button>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	)
} 