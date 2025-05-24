import { usePathname } from 'next/navigation'
import PATHS from '@/utils/paths'

interface PageInfo {
	title: string
	description: string
}

export function usePageInfo(): PageInfo {
	const pathname = usePathname()

	// Map of routes to page information
	const pageMap: Record<string, PageInfo> = {
		[PATHS.DASHBOARD.ROOT]: {
			title: 'Dashboard',
			description: ''
		},
		[PATHS.DASHBOARD.TODAY_SUMMARY]: {
			title: 'Today\'s Summary',
			description: ''
		},
		[PATHS.DASHBOARD.EMAIL_ANALYTICS]: {
			title: 'Email Analytics',
			description: ''
		},
		[PATHS.DASHBOARD.EMAIL_HEALTH]: {
			title: 'Email Health',
			description: ''
		},
		[PATHS.DASHBOARD.CONNECTED_EMAILS]: {
			title: 'Connected Emails',
			description: ''
		},
		[PATHS.DASHBOARD.SUBSCRIPTION]: {
			title: 'Subscription',
			description: ''
		},
		[PATHS.DASHBOARD.SETTINGS]: {
			title: 'Settings',
			description: ''
		}
	}

	// Return the page info for the current path, or default
	return pageMap[pathname] || {
		title: 'Dashboard',
		description: ''
	}
} 