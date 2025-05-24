import Link from 'next/link'
import ProfileFooter from '@/components/dashboard/ProfileFooter'
import PATHS from '@/utils/paths'

interface SideMenuProps {
	onLinkClick?: () => void // Optional: To handle actions like closing the menu on mobile
}

export default function SideMenu({ onLinkClick }: SideMenuProps) {
	return (
		<>
			<div className="overflow-y-auto flex-grow">
				<nav className="space-y-4 pt-10 md:pt-0">
					<h2 className="text-lg font-semibold mb-6">My Account</h2>
					<ul className="space-y-2">
						<li>
							<Link
								href={PATHS.DASHBOARD.INTERPRET.ROOT}
								className="block px-4 py-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
								onClick={onLinkClick}
							>
								Interpret a new email
							</Link>
						</li>
						<li>
							<Link
								href={PATHS.DASHBOARD.ROOT}
								className="block px-4 py-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
								onClick={onLinkClick}
							>
								My emails
							</Link>
						</li>
						<li>
							<Link
								href={PATHS.DASHBOARD.SUBSCRIPTION}
								aria-disabled="true"
								className="block px-4 py-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors opacity-50 pointer-events-none"
								onClick={onLinkClick} // still call onLinkClick even if disabled for consistency
							>
								Email insights
							</Link>
						</li>
						<li>
							<Link
								href={PATHS.DASHBOARD.SUBSCRIPTION}
								className="block px-4 py-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
								onClick={onLinkClick}
							>
								Subscription
							</Link>
						</li>
						<li>
							<Link
								href={PATHS.DASHBOARD.SETTINGS}
								className="block px-4 py-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
								onClick={onLinkClick}
							>
								Settings
							</Link>
						</li>
					</ul>
				</nav>
			</div>
			<ProfileFooter />
		</>
	)
}
