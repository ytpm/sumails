import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard } from 'lucide-react'
import type { Subscription } from '@/contexts/auth-context'

interface SubscriptionCardProps {
	subscriptionData: Subscription | null
	onManageSubscription: () => void
	onCancelSubscription: () => void
}

export default function SubscriptionCard({ 
	subscriptionData, 
	onManageSubscription, 
	onCancelSubscription 
}: SubscriptionCardProps) {
	if (!subscriptionData || subscriptionData.status !== 'active') {
		return null
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="h-5 w-5" />
					Subscription
				</CardTitle>
				<CardDescription>
					Manage your subscription and billing
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Plan</Label>
						<p className="text-lg font-semibold">{subscriptionData.plan_name}</p>
					</div>
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Status</Label>
						<p className="text-lg font-semibold capitalize text-green-600">
							{subscriptionData.status}
						</p>
					</div>
				</div>
				
				{subscriptionData.current_period_end && (
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Renews on</Label>
						<p className="text-base">
							{new Date(subscriptionData.current_period_end).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</p>
					</div>
				)}

				<Separator />

				<div className="flex flex-col sm:flex-row gap-3">
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
				</div>
			</CardContent>
		</Card>
	)
} 