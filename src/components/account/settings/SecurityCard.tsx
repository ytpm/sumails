import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ExternalLink } from 'lucide-react'

export default function SecurityCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					Security
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<Link href="/auth/update-password">
					<Button variant="outline" className="w-full justify-between">
						Change Password
						<ExternalLink className="h-4 w-4" />
					</Button>
				</Link>
				<p className="text-xs text-muted-foreground">
					Update your account password for better security
				</p>
			</CardContent>
		</Card>
	)
} 