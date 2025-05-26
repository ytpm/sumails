'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Phone, Shield } from 'lucide-react'
import { sendVerificationCode, verifyCode } from '@/utils/api/sms'

interface PhoneVerificationProps {
	onVerificationComplete: (phoneNumber: string) => void
	onCancel?: () => void
}

export default function PhoneVerification({ 
	onVerificationComplete, 
	onCancel 
}: PhoneVerificationProps) {
	const [phoneNumber, setPhoneNumber] = useState('')
	const [verificationCodeInput, setVerificationCodeInput] = useState('')
	const [isCodeSent, setIsCodeSent] = useState(false)
	const [isSending, setIsSending] = useState(false)
	const [isVerifying, setIsVerifying] = useState(false)
	const [countdown, setCountdown] = useState(0)

	const formatPhoneNumber = (value: string) => {
		// Remove all non-digits and non-plus signs
		let formatted = value.replace(/[^\d+]/g, '')
		
		// Ensure it starts with + if there are digits
		if (formatted.length > 0 && !formatted.startsWith('+')) {
			formatted = '+' + formatted
		}
		
		return formatted
	}

	const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value)
		setPhoneNumber(formatted)
	}

	const startCountdown = () => {
		setCountdown(60)
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}

	const handleSendCode = async () => {
		if (!phoneNumber || phoneNumber.length < 10) {
			toast.error('Please enter a valid phone number')
			return
		}

		try {
			setIsSending(true)
			await sendVerificationCode(phoneNumber)
			setIsCodeSent(true)
			startCountdown()
			toast.success('Verification code sent to your phone')
		} catch (error) {
			console.error('Error sending verification code:', error)
			toast.error('Failed to send verification code. Please try again.')
		} finally {
			setIsSending(false)
		}
	}

	const handleVerifyCode = async () => {
		if (!verificationCodeInput || verificationCodeInput.length !== 5) {
			toast.error('Please enter the 5-digit verification code')
			return
		}

		try {
			setIsVerifying(true)
			const isValid = verifyCode(phoneNumber, verificationCodeInput)
			
			if (isValid) {
				toast.success('🎉 Elite hacker code accepted! Phone number verified successfully!', {
					duration: 4000,
				})
				onVerificationComplete(phoneNumber)
			} else {
				toast.error('Invalid or expired verification code')
			}
		} catch (error) {
			console.error('Error verifying code:', error)
			toast.error('Failed to verify code. Please try again.')
		} finally {
			setIsVerifying(false)
		}
	}

	const handleResendCode = async () => {
		if (countdown > 0) return
		await handleSendCode()
	}

	return (
		<div className="space-y-4 p-4 border rounded-lg bg-muted/50">
			<div className="flex items-center gap-2 text-sm font-medium">
				<Phone className="h-4 w-4" />
				WhatsApp Phone Verification
			</div>
			
			{!isCodeSent ? (
				<div className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="phone-number">Phone Number</Label>
						<div className="flex gap-2">
							<Input
								id="phone-number"
								type="tel"
								placeholder="+1 (555) 123-4567"
								value={phoneNumber}
								onChange={handlePhoneNumberChange}
								className="flex-1"
							/>
							<Button 
								onClick={handleSendCode}
								disabled={isSending || !phoneNumber}
								size="sm"
							>
								{isSending ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Sending...
									</>
								) : (
									'Send Code'
								)}
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							We'll send a 5-digit verification code to this number
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="verification-code" className="flex items-center gap-2">
							<Shield className="h-4 w-4" />
							Verification Code
						</Label>
						<div className="flex gap-2">
							<Input
								id="verification-code"
								type="text"
								placeholder="31337"
								value={verificationCodeInput}
								onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
								className="flex-1"
								maxLength={5}
							/>
							<Button 
								onClick={handleVerifyCode}
								disabled={isVerifying || verificationCodeInput.length !== 5}
								size="sm"
							>
								{isVerifying ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Verifying...
									</>
								) : (
									'Verify'
								)}
							</Button>
						</div>
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>Code sent to {phoneNumber}</span>
							<Button
								variant="link"
								size="sm"
								onClick={handleResendCode}
								disabled={countdown > 0}
								className="h-auto p-0 text-xs"
							>
								{countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
							</Button>
						</div>
					</div>
				</div>
			)}

			{onCancel && (
				<div className="flex justify-end">
					<Button variant="outline" size="sm" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			)}
		</div>
	)
} 