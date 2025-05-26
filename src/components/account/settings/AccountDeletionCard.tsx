import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface AccountDeletionCardProps {
	onDeleteAccount: () => void
	isDeletingAccount: boolean
}

export default function AccountDeletionCard({ 
	onDeleteAccount, 
	isDeletingAccount 
}: AccountDeletionCardProps) {
	return (
		<Card className="border-destructive/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<Trash2 className="h-5 w-5" />
					Danger Zone
				</CardTitle>
				<CardDescription>
					Permanently delete your account and all associated data
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="p-4 bg-destructive/5 border border-destructive/20 rounded-md">
						<h4 className="font-medium text-destructive mb-2">Delete Account</h4>
						<p className="text-sm text-muted-foreground mb-4">
							This action cannot be undone. This will permanently delete your account, 
							all connected mailboxes, summaries, and remove all associated data from our servers.
						</p>
						<Button 
							variant="destructive" 
							onClick={onDeleteAccount}
							disabled={isDeletingAccount}
							className="min-w-[140px]"
						>
							{isDeletingAccount ? 'Deleting...' : 'Delete Account'}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
} 