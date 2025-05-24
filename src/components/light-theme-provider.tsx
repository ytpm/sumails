'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface LightThemeProviderProps {
	children: React.ReactNode
}

export function LightThemeProvider({ children }: LightThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="light"
			forcedTheme="light"
			enableSystem={false}
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	)
} 