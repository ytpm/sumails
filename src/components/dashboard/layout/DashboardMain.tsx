'use client'

import { ReactNode } from 'react'
import SideMenu from './SideMenu'
import DashboardNavbar from '../DashboardNavbar'
import { usePageInfo } from '@/hooks/usePageInfo'
// import MobileMenu from './MobileMenu'

interface DashboardMainProps {
	children: ReactNode
}

export default function DashboardMain({ children }: DashboardMainProps) {
	const { title, description } = usePageInfo()

	return (
		<div className="flex h-screen bg-background text-foreground overflow-hidden">
			{/* Desktop Sidebar (visible only on md screens and up) */}
			<aside className="w-64 bg-muted/40 border-r border-border p-6 hidden md:flex md:flex-col md:justify-between overflow-y-auto">
				<SideMenu />
			</aside>

			{/* Mobile Menu (handles its own visibility and behavior) */}
			{/* <MobileMenu /> */}

			{/* Main Content Area with Navbar */}
			<div className="flex-1 flex flex-col">
				{/* Navigation Bar */}
				<DashboardNavbar title={title} description={description} />
				
				{/* Main Content */}
				<main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-background">
					{children}
				</main>
			</div>
		</div>
	)
} 