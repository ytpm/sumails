'use client'

import { Button } from '@/components/ui/button'

export default function ProfileFooter() {
	return (
		<div className="border-t border-border pt-4 mt-4">
			<div className="flex items-center space-x-3 mb-3">
				<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
					<span className="text-primary-foreground text-sm font-medium">U</span>
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium">User</p>
					<p className="text-xs text-muted-foreground">user@example.com</p>
				</div>
			</div>
			<Button variant="ghost" size="sm" className="w-full justify-start">
				Sign out
			</Button>
		</div>
	)
} 