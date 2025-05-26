import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell } from 'lucide-react'

interface NotificationSettings {
	productUpdates: boolean
	marketingEmails: boolean
}

interface NotificationPreferencesCardProps {
	notifications: NotificationSettings
	onNotificationChange: (key: keyof NotificationSettings) => void
}

export default function NotificationPreferencesCard({ 
	notifications, 
	onNotificationChange 
}: NotificationPreferencesCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Notification Preferences
				</CardTitle>
				<CardDescription>
					Choose what notifications you'd like to receive
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="product-updates">Product Updates</Label>
						<p className="text-sm text-muted-foreground">
							News about new features and improvements
						</p>
					</div>
					<Switch
						id="product-updates"
						checked={notifications.productUpdates}
						onCheckedChange={() => onNotificationChange('productUpdates')}
					/>
				</div>
				<Separator />
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="marketing-emails">Marketing Emails</Label>
						<p className="text-sm text-muted-foreground">
							Tips, tutorials, and promotional content
						</p>
					</div>
					<Switch
						id="marketing-emails"
						checked={notifications.marketingEmails}
						onCheckedChange={() => onNotificationChange('marketingEmails')}
					/>
				</div>
			</CardContent>
		</Card>
	)
} 