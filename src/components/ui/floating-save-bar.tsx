import { Button } from '@/components/ui/button'
import { Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingSaveBarProps {
	isVisible: boolean
	isSaving: boolean
	onSave: () => void
	onDiscard: () => void
	className?: string
}

export function FloatingSaveBar({
	isVisible,
	isSaving,
	onSave,
	onDiscard,
	className
}: FloatingSaveBarProps) {
	if (!isVisible) return null

	return (
		<div
			className={cn(
				'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border shadow-lg',
				'transform transition-transform duration-300 ease-in-out',
				isVisible ? 'translate-y-0' : 'translate-y-full',
				className
			)}
		>
			<div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center space-x-2 text-sm text-muted-foreground">
					<div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
					<span>You have unsaved changes</span>
				</div>
				
				<div className="flex items-center space-x-3">
					<Button
						variant="outline"
						size="sm"
						onClick={onDiscard}
						disabled={isSaving}
						className="flex items-center space-x-2"
					>
						<X className="h-4 w-4" />
						<span>Discard</span>
					</Button>
					
					<Button
						size="sm"
						onClick={onSave}
						disabled={isSaving}
						className="flex items-center space-x-2 min-w-[100px]"
					>
						<Save className="h-4 w-4" />
						<span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
					</Button>
				</div>
			</div>
		</div>
	)
} 