import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ExternalLink } from 'lucide-react'

export default function EmailManagementCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Mail className="h-5 w-5" />
					Email Management
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<Link href="/account/mailboxes">
					<Button variant="outline" className="w-full justify-between">
						Mailboxes
						<ExternalLink className="h-4 w-4" />
					</Button>
				</Link>
				<p className="text-xs text-muted-foreground">
					Manage your connected email mailboxes and view summaries
				</p>
			</CardContent>
		</Card>
	)
} 