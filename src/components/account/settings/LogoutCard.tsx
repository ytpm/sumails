import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutCardProps {
	onLogout: () => void
}

export default function LogoutCard({ onLogout }: LogoutCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Sign Out</CardTitle>
				<CardDescription>
					Sign out of your account on this device
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button
					variant="outline"
					onClick={onLogout}
					className="w-full flex items-center justify-center space-x-2 text-destructive hover:text-destructive hover:bg-destructive/10"
				>
					<LogOut className="h-4 w-4" />
					<span>Sign Out</span>
				</Button>
			</CardContent>
		</Card>
	)
} 