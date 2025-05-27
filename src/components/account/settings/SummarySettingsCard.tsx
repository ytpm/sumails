import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Clock, Globe, MessageSquare, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import PhoneVerification from './PhoneVerification'

interface SummarySettings {
	receiveBy: {
		email: boolean
		whatsapp: boolean
	}
	preferredTime: string
	timezone: string
	language: string
}

interface SummarySettingsCardProps {
	settings: SummarySettings
	whatsappPhone?: string | null
	onReceiveByChange: (key: keyof SummarySettings['receiveBy']) => void
	onSettingChange: (key: keyof Omit<SummarySettings, 'receiveBy'>, value: string) => void
	onProfileChange: (key: 'whatsappNumber', value: string | null) => void
}

export default function SummarySettingsCard({ 
	settings, 
	whatsappPhone, 
	onReceiveByChange, 
	onSettingChange, 
	onProfileChange 
}: SummarySettingsCardProps) {
	const [showPhoneVerification, setShowPhoneVerification] = useState(false)

	const handleWhatsAppToggle = () => {
		if (!settings.receiveBy.whatsapp) {
			// Enabling WhatsApp - show verification if no phone is verified
			if (!whatsappPhone) {
				setShowPhoneVerification(true)
			}
		} else {
			// Disabling WhatsApp
			setShowPhoneVerification(false)
		}
		onReceiveByChange('whatsapp')
	}

	const handlePhoneVerificationComplete = (phoneNumber: string) => {
		// Save the verified phone number
		onProfileChange('whatsappNumber', phoneNumber)
		setShowPhoneVerification(false)
	}

	const handleCancelVerification = () => {
		setShowPhoneVerification(false)
		// If WhatsApp was just enabled but verification was cancelled, disable it
		if (settings.receiveBy.whatsapp && !whatsappPhone) {
			onReceiveByChange('whatsapp')
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					Summary Settings
				</CardTitle>
				<CardDescription>
					Configure how and when you receive your email summaries
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Delivery Methods */}
				<div>
					<Label className="text-base font-medium">Receive summaries by</Label>
					<div className="mt-3 space-y-3">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="summary-email">Email</Label>
								<p className="text-sm text-muted-foreground">
									Get summaries delivered to your email inbox
								</p>
							</div>
							<Switch
								id="summary-email"
								checked={settings.receiveBy.email}
								onCheckedChange={() => onReceiveByChange('email')}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="summary-whatsapp" className="flex items-center gap-2">
									WhatsApp
									{whatsappPhone && (
										<CheckCircle className="h-4 w-4 text-green-600" />
									)}
								</Label>
								<p className="text-sm text-muted-foreground">
									Get summaries via WhatsApp messages
									{whatsappPhone && (
										<span className="block text-xs text-green-600 mt-1">
											Verified: {whatsappPhone}
										</span>
									)}
								</p>
							</div>
							<Switch
								id="summary-whatsapp"
								checked={settings.receiveBy.whatsapp}
								onCheckedChange={handleWhatsAppToggle}
							/>
						</div>
						
						{/* Phone Verification Component */}
						{showPhoneVerification && (
							<PhoneVerification
								onVerificationComplete={handlePhoneVerificationComplete}
								onCancel={handleCancelVerification}
							/>
						)}
					</div>
				</div>

				<Separator />

				{/* Timing Settings */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="preferred-time" className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Preferred Time
						</Label>
						<Select
							value={settings.preferredTime}
							onValueChange={(value) => onSettingChange('preferredTime', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select time" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="06:00">6:00 AM</SelectItem>
								<SelectItem value="07:00">7:00 AM</SelectItem>
								<SelectItem value="08:00">8:00 AM</SelectItem>
								<SelectItem value="09:00">9:00 AM</SelectItem>
								<SelectItem value="10:00">10:00 AM</SelectItem>
								<SelectItem value="11:00">11:00 AM</SelectItem>
								<SelectItem value="12:00">12:00 PM</SelectItem>
								<SelectItem value="18:00">6:00 PM</SelectItem>
								<SelectItem value="19:00">7:00 PM</SelectItem>
								<SelectItem value="20:00">8:00 PM</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="timezone" className="flex items-center gap-2">
							<Globe className="h-4 w-4" />
							Timezone
						</Label>
						<Select
							value={settings.timezone}
							onValueChange={(value) => onSettingChange('timezone', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select timezone" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="UTC">UTC</SelectItem>
								<SelectItem value="America/New_York">Eastern Time</SelectItem>
								<SelectItem value="America/Chicago">Central Time</SelectItem>
								<SelectItem value="America/Denver">Mountain Time</SelectItem>
								<SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
								<SelectItem value="Europe/London">London</SelectItem>
								<SelectItem value="Europe/Paris">Paris</SelectItem>
								<SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
								<SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
								<SelectItem value="Australia/Sydney">Sydney</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* Language/Tone Settings */}
				<div className="space-y-2">
					<Label htmlFor="language-tone" className="flex items-center gap-2">
						<MessageSquare className="h-4 w-4" />
						Summary Tone
					</Label>
					<Select
						value={settings.language}
						onValueChange={(value) => onSettingChange('language', value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select tone" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="formal">Formal - Professional and structured</SelectItem>
							<SelectItem value="friendly">Friendly - Conversational and warm</SelectItem>
							<SelectItem value="minimalist">Minimalist - Brief and to the point</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	)
} 