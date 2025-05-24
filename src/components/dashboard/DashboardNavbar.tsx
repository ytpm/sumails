import { ThemeToggle } from '@/components/theme-toggle'

interface DashboardNavbarProps {
	title?: string
	description?: string
}

export default function DashboardNavbar({ title, description }: DashboardNavbarProps) {
	return (
		<nav className="border-b border-border bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-between px-6">
				<div className="flex flex-col">
					{title && (
						<h1 className="text-lg font-semibold leading-none text-foreground">{title}</h1>
					)}
					{description && (
						<p className="text-sm text-muted-foreground mt-1">{description}</p>
					)}
				</div>
				<div className="flex items-center space-x-4">
					<ThemeToggle />
				</div>
			</div>
		</nav>
	)
} 