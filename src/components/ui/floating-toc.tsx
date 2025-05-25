'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

interface TocItem {
	id: string
	title: string
	description?: string
}

interface FloatingTocProps {
	items: TocItem[]
	className?: string
}

export function FloatingToc({ items, className }: FloatingTocProps) {
	const [activeSection, setActiveSection] = useState<string>('')
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				// Find the entry that is intersecting and has the highest intersection ratio
				const visibleEntries = entries.filter(entry => entry.isIntersecting)
				if (visibleEntries.length > 0) {
					// Sort by intersection ratio and take the most visible one
					const mostVisible = visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
					setActiveSection(mostVisible.target.id)
				}
			},
			{
				rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the middle portion of viewport
				threshold: [0, 0.25, 0.5, 0.75, 1]
			}
		)

		// Observe all sections
		items.forEach(item => {
			const element = document.getElementById(item.id)
			if (element) {
				observer.observe(element)
			}
		})

		return () => observer.disconnect()
	}, [items])

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id)
		if (element) {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			})
			// Close mobile menu after navigation
			setIsOpen(false)
		}
	}

	return (
		<>
			{/* Mobile Toggle Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'fixed top-4 left-4 z-50 xl:hidden',
					'bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg',
					'p-2 hover:bg-muted/50 transition-colors'
				)}
				aria-label="Toggle table of contents"
			>
				{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</button>

			{/* Desktop Floating TOC */}
			<div className={cn(
				'fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:block',
				'w-64 max-h-[70vh] overflow-y-auto',
				'bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg',
				'p-4',
				className
			)}>
				<h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
					Contents
				</h3>
				<nav className="space-y-1">
					{items.map((item) => (
						<button
							key={item.id}
							onClick={() => scrollToSection(item.id)}
							className={cn(
								'w-full text-left p-2 rounded-md text-sm transition-all duration-200',
								'hover:bg-muted/50 hover:text-foreground',
								'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
								activeSection === item.id
									? 'bg-primary/10 text-primary border-l-2 border-primary font-medium'
									: 'text-muted-foreground border-l-2 border-transparent'
							)}
						>
							<div className="font-medium">{item.title}</div>
							{item.description && (
								<div className="text-xs text-muted-foreground mt-0.5 overflow-hidden" style={{ 
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical'
								}}>
									{item.description}
								</div>
							)}
						</button>
					))}
				</nav>
			</div>

			{/* Mobile Overlay TOC */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div 
						className="fixed inset-0 bg-black/50 z-40 xl:hidden"
						onClick={() => setIsOpen(false)}
					/>
					
					{/* Mobile TOC */}
					<div className={cn(
						'fixed left-4 top-16 z-50 xl:hidden',
						'w-72 max-h-[calc(100vh-5rem)] overflow-y-auto',
						'bg-background border rounded-lg shadow-lg',
						'p-4'
					)}>
						<h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
							Contents
						</h3>
						<nav className="space-y-1">
							{items.map((item) => (
								<button
									key={item.id}
									onClick={() => scrollToSection(item.id)}
									className={cn(
										'w-full text-left p-2 rounded-md text-sm transition-all duration-200',
										'hover:bg-muted/50 hover:text-foreground',
										'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
										activeSection === item.id
											? 'bg-primary/10 text-primary border-l-2 border-primary font-medium'
											: 'text-muted-foreground border-l-2 border-transparent'
									)}
								>
									<div className="font-medium">{item.title}</div>
									{item.description && (
										<div className="text-xs text-muted-foreground mt-0.5 overflow-hidden" style={{ 
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical'
										}}>
											{item.description}
										</div>
									)}
								</button>
							))}
						</nav>
					</div>
				</>
			)}
		</>
	)
} 