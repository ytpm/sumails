import { ReactNode } from 'react'
import DashboardMain from '@/components/dashboard/layout/DashboardMain'
import { ThemeProvider } from '@/providers/themes/ThemeProvider'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeProvider>
      <DashboardMain>
        {children}
      </DashboardMain>
    </ThemeProvider>
  )
}