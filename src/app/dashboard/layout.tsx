import { ReactNode } from 'react'
import DashboardMain from '@/components/dashboard/layout/DashboardMain'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardMain>{children}</DashboardMain>
}