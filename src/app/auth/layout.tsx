import { ReactNode } from 'react'
import { LightThemeProvider } from '@/providers/themes/LightThemeProvider'

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