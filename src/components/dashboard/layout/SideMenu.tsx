'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ProfileFooter from '@/components/dashboard/ProfileFooter'
import PATHS from '@/utils/paths'
import { cn } from '@/lib/utils'

interface SideMenuProps {
	onLinkClick?: () => void // Optional: To handle actions like closing the menu on mobile
}

const navigationItems = [
	{
		href: PATHS.DASHBOARD.TODAY_SUMMARY,
		label: 'Today\'s summary',
		disabled: false
	},
	{
		href: PATHS.DASHBOARD.SUMMARY,
		label: 'Summary',
		disabled: false
	},
	{
		href: PATHS.DASHBOARD.EMAIL_ANALYTICS,
		label: 'Email analytics',
		disabled: false
	},
	{
		href: PATHS.DASHBOARD.EMAIL_HEALTH,
		label: 'Email health',
		disabled: false
	},
	{
		href: PATHS.DASHBOARD.CONNECTED_EMAILS,
		label: 'Connected emails',
		disabled: false
	},
	{
		href: PATHS.DASHBOARD.SUBSCRIPTION,
		label: 'Subscription',
		disabled: false
	},
	{
		href: PATHS.DASHBOARD.SETTINGS,
		label: 'Settings',
		disabled: false
	}
]

export default function SideMenu({ onLinkClick }: SideMenuProps) {
	const pathname = usePathname()

	return (
		<>
			<div className="overflow-y-auto flex-grow">
				<nav className="space-y-4 pt-10 md:pt-0">
					<h2 className="text-lg font-semibold mb-6 text-foreground">My Account</h2>
					<ul className="space-y-1">
						{navigationItems.map((item, index) => {
							const isActive = pathname === item.href
							
							return (
								<li key={index}>
									<Link
										href={item.href}
										className={cn(
											"block px-4 py-2 rounded-md transition-colors duration-200",
											item.disabled 
												? "text-muted-foreground/50 hover:bg-accent/50 hover:text-accent-foreground/50 opacity-50 pointer-events-none cursor-not-allowed"
												: isActive
													? "bg-accent text-accent-foreground font-medium"
													: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
										)}
										onClick={onLinkClick}
										aria-disabled={item.disabled}
									>
										{item.label}
									</Link>
								</li>
							)
						})}
					</ul>
				</nav>
			</div>
			<ProfileFooter />
		</>
	)
}
