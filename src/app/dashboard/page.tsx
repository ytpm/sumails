'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PATHS from '@/utils/paths'

export default function DashboardHomepage() {
	const router = useRouter()

	useEffect(() => {
		// Redirect to Today's Summary as the default dashboard page
		router.push(PATHS.DASHBOARD.TODAY_SUMMARY)
	}, [router])

	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
				<p className="text-muted-foreground">Redirecting to Today's Summary...</p>
			</div>
		</div>
	)
}