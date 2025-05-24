'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	confirmText?: string
	cancelText?: string
	confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
	onConfirm: () => void
	onCancel?: () => void
	isLoading?: boolean
	icon?: React.ReactNode
}

export function ConfirmationDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	confirmVariant = 'default',
	onConfirm,
	onCancel,
	isLoading = false,
	icon
}: ConfirmationDialogProps) {
	const handleCancel = () => {
		if (onCancel) {
			onCancel()
		}
		onOpenChange(false)
	}

	const handleConfirm = () => {
		onConfirm()
		// Don't automatically close if loading - let the parent handle this
		if (!isLoading) {
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="space-y-3">
					<DialogTitle className="flex items-center gap-3 text-foreground">
						{icon && (
							<div className="flex-shrink-0">
								{icon}
							</div>
						)}
						{title}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex gap-2 sm:gap-2">
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						variant={confirmVariant}
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
								Processing...
							</>
						) : (
							confirmText
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
} 