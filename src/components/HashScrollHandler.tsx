'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function HashScrollHandlerInner() {
	const searchParams = useSearchParams()

	useEffect(() => {
		// Check if there's a hash in the URL
		const hash = window.location.hash.replace('#', '')
		
		if (hash) {
			// Small delay to ensure the page has rendered
			const timer = setTimeout(() => {
				const element = document.getElementById(hash)
				if (element) {
					element.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
					})
				}
			}, 100)

			return () => clearTimeout(timer)
		}
	}, [searchParams])

	return null
}

export default function HashScrollHandler() {
	return (
		<Suspense fallback={null}>
			<HashScrollHandlerInner />
		</Suspense>
	)
} 