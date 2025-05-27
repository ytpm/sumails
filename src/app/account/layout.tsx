import React from 'react'
import Header from '@/components/layout/Header'

interface AccountLayoutProps {
	children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
	return (
		<>
			<Header />
			<div className="pt-16">
				{children}
			</div>
		</>
	)
} 