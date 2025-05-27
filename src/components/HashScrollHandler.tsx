'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function HashScrollHandler() {
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