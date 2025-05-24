'use client'

import { ReactNode } from 'react'
// import SideMenu from './SideMenu'
// import MobileMenu from './MobileMenu'

interface DashboardMainProps {
  children: ReactNode
}

export default function DashboardMain({ children }: DashboardMainProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar (visible only on md screens and up) */}
      <aside className="w-64 bg-muted p-6 hidden md:flex md:flex-col md:justify-between overflow-y-auto">
        {/* <SideMenu /> */}
        Side Menu
      </aside>

      {/* Mobile Menu (handles its own visibility and behavior) */}
      {/* <MobileMenu /> */}
      Mobile Menu

      {/* Main Content Area */}
      {/* Adjusted padding top for mobile to account for the fixed mobile header */}
      {/* The pt-0 on md screens removes the mobile padding when desktop sidebar is visible */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto pt-20 md:pt-6">
        {children}
      </main>
    </div>
  )
} 