import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'

interface AccountInformationCardProps {
	email?: string
}

export default function AccountInformationCard({ email }: AccountInformationCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Account Information
				</CardTitle>
				<CardDescription>
					Your basic account details
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label htmlFor="email">Email Address</Label>
					<div className="mt-1 p-3 bg-muted rounded-md">
						<p className="text-sm text-muted-foreground">
							{email || 'No email available'}
						</p>
					</div>
				</div>
				<div>
					<Label>Account Status</Label>
					<div className="mt-1 p-3 bg-muted rounded-md">
						<p className="text-sm text-green-600 font-medium">
							✓ Verified
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
} 