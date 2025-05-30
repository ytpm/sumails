import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { User } from 'lucide-react'
import { ChangeEvent, useState, useEffect } from 'react'

interface AccountInformationCardProps {
	email?: string
	fullName?: string
	phoneNumber?: string
	personalContext?: string
	onFullNameChange?: (value: string) => void
	onPhoneNumberChange?: (value: string) => void
	onPersonalContextChange?: (value: string) => void
}

export default function AccountInformationCard({ 
	email, 
	fullName, 
	phoneNumber, 
	personalContext,
	onFullNameChange,
	onPhoneNumberChange,
	onPersonalContextChange
}: AccountInformationCardProps) {
	// Internal state for when no external handlers are provided
	const [internalFullName, setInternalFullName] = useState(fullName || '')
	const [internalPhoneNumber, setInternalPhoneNumber] = useState(phoneNumber || '')
	const [internalPersonalContext, setInternalPersonalContext] = useState(personalContext || '')

	// Update internal state when props change
	useEffect(() => {
		setInternalFullName(fullName || '')
	}, [fullName])

	useEffect(() => {
		setInternalPhoneNumber(phoneNumber || '')
	}, [phoneNumber])

	useEffect(() => {
		setInternalPersonalContext(personalContext || '')
	}, [personalContext])

	// Use external handlers if provided, otherwise use internal state
	const handleFullNameChange = (value: string) => {
		if (onFullNameChange) {
			onFullNameChange(value)
		} else {
			setInternalFullName(value)
		}
	}

	const handlePhoneNumberChange = (value: string) => {
		if (onPhoneNumberChange) {
			onPhoneNumberChange(value)
		} else {
			setInternalPhoneNumber(value)
		}
	}

	const handlePersonalContextChange = (value: string) => {
		if (onPersonalContextChange) {
			onPersonalContextChange(value)
		} else {
			setInternalPersonalContext(value)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Account Information
				</CardTitle>
				<CardDescription>
					Your basic account details
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label htmlFor="full-name">Full Name</Label>
					<Input
						id="full-name"
						type="text"
						value={onFullNameChange ? (fullName || '') : internalFullName}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleFullNameChange(e.target.value)}
						placeholder="Enter your full name"
						className="mt-1"
					/>
				</div>
				<div>
					<Label htmlFor="email">Email Address</Label>
					<Input
						id="email"
						type="email"
						value={email || ''}
						disabled
						className="mt-1 bg-muted"
					/>
				</div>
				<div>
					<PhoneInput
						label="Phone Number"
						value={onPhoneNumberChange ? (phoneNumber || '') : internalPhoneNumber}
						onChange={handlePhoneNumberChange}
					/>
				</div>
				<div>
					<Label htmlFor="personal-context">Personal Context</Label>
					<textarea
						id="personal-context"
						value={onPersonalContextChange ? (personalContext || '') : internalPersonalContext}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handlePersonalContextChange(e.target.value)}
						placeholder="Provide context about your role, priorities, and email preferences to help our AI deliver more accurate summaries. Example: 'I am a software developer working in a startup environment. I regularly receive automated notifications from development tools (GitHub, Vercel, AWS), security alerts from various platforms, and promotional emails from SaaS providers. I prioritize emails requiring immediate action such as client communications, critical system alerts, and time-sensitive business decisions. Please filter out routine automated notifications and promotional content to focus on actionable items.'"
						className="mt-1 min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						rows={4}
					/>
					<p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200 mt-2">
						💡 <strong>Note:</strong> Adding a personal context will help our AI summarize emails to better understand your needs and provide much more accurate summaries. Include details about yourself, your role, and email preferences.
					</p>
				</div>
				<div>
					<Label>Account Status</Label>
					<div className="mt-1 p-3 bg-muted rounded-md">
						<p className="text-sm text-green-600 font-medium">
							✓ Verified
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
} 