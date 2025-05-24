'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = React.useState(false)

	// Avoid hydration mismatch
	React.useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<div className="flex items-center space-x-2">
				<Sun className="h-4 w-4 text-muted-foreground" />
				<Switch disabled />
				<Moon className="h-4 w-4 text-muted-foreground" />
			</div>
		)
	}

	const isDark = theme === 'dark'

	return (
		<div className="flex items-center space-x-2">
			<Sun className={`h-4 w-4 transition-colors ${isDark ? 'text-muted-foreground' : 'text-yellow-500'}`} />
			<Switch
				checked={isDark}
				onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
				aria-label="Toggle theme"
				className="data-[state=checked]:bg-primary"
			/>
			<Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-blue-400' : 'text-muted-foreground'}`} />
		</div>
	)
} 