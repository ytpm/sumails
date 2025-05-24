import { ReactNode } from 'react'
import DashboardMain from '@/components/dashboard/layout/DashboardMain'
import { ThemeProvider } from '@/components/theme-provider'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeProvider>
      <DashboardMain 
        title="Gmail Integration Dashboard" 
        description="Connect and manage your Gmail emails with our AI-powered email analysis tools."
      >
        {children}
      </DashboardMain>
    </ThemeProvider>
  )
}