import { ReactNode } from 'react'
import { LightThemeProvider } from '@/components/light-theme-provider'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <LightThemeProvider>
      {children}
    </LightThemeProvider>
  )
} 