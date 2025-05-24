import { ReactNode } from 'react'

interface ContentViewProps {
	children: ReactNode
}

export default function ContentView({ children }: ContentViewProps) {
	return (
		<div className="w-full">
			{children}
		</div>
	)
}
