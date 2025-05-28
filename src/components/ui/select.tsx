import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
	value?: string
	onValueChange?: (value: string) => void
	open: boolean
	setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
	const context = React.useContext(SelectContext)
	if (!context) {
		throw new Error("Select components must be used within a Select")
	}
	return context
}

interface SelectProps {
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
	children: React.ReactNode
}

const Select = ({ value, defaultValue, onValueChange, children }: SelectProps) => {
	const [open, setOpen] = React.useState(false)
	const [internalValue, setInternalValue] = React.useState(defaultValue || "")
	const selectRef = React.useRef<HTMLDivElement>(null)
	
	const currentValue = value !== undefined ? value : internalValue
	
	const handleValueChange = (newValue: string) => {
		if (value === undefined) {
			setInternalValue(newValue)
		}
		onValueChange?.(newValue)
		setOpen(false)
	}

	// Close select when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
				setOpen(false)
			}
		}

		if (open) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [open])

	return (
		<SelectContext.Provider value={{ 
			value: currentValue, 
			onValueChange: handleValueChange, 
			open, 
			setOpen 
		}}>
			<div ref={selectRef} className="relative">
				{children}
			</div>
		</SelectContext.Provider>
	)
}

const SelectTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & { id?: string }
>(({ className, children, id, ...props }, ref) => {
	const { open, setOpen } = useSelectContext()
	
	return (
		<button
			ref={ref}
			id={id}
			type="button"
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			onClick={() => setOpen(!open)}
			{...props}
		>
			{children}
			<ChevronDown className="h-4 w-4 opacity-50" />
		</button>
	)
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
	const { value } = useSelectContext()
	
	return (
		<span ref={ref} className={cn(className)} {...props}>
			{value || placeholder}
		</span>
	)
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
	const { open } = useSelectContext()
	
	if (!open) return null
	
	return (
		<div
			ref={ref}
			className={cn(
				"absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
				"top-full mt-1 w-full",
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
	const { onValueChange } = useSelectContext()
	
	return (
		<div
			ref={ref}
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className
			)}
			onClick={() => onValueChange?.(value)}
			{...props}
		>
			{children}
		</div>
	)
})
SelectItem.displayName = "SelectItem"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } 