import { ReactNode } from 'react'
import DashboardMain from '@/components/dashboard/layout/DashboardMain'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardMain 
      title="Gmail Integration Dashboard" 
      description="Connect and manage your Gmail emails with our AI-powered email analysis tools."
    >
      {children}
    </DashboardMain>
  )
}