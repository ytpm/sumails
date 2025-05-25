'use client';

import ContentView from '@/components/dashboard/layout/ContentView'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Download, AlertTriangle, Trash2 } from 'lucide-react';

export default function SettingsPage() {
	// Placeholder for timezones - in a real app, this would be more comprehensive
	const timezones = [
		{ value: "Etc/GMT+12", label: "(GMT-12:00) International Date Line West" },
		{ value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
		{ value: "Europe/London", label: "(GMT+00:00) London" },
		{ value: "Asia/Jerusalem", label: "(GMT+02:00) Jerusalem" },
		{ value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
	];

	const summaryTimes = Array.from({ length: 24 }, (_, i) => {
		const hour = i.toString().padStart(2, '0');
		return { value: `${hour}:00`, label: `${hour}:00` };
	});

	return (
		<ContentView>
			<div className="space-y-10 max-w-4xl mx-auto pb-12">
				{/* User Settings */}
				<Card id="user-settings">
					<CardHeader>
						<CardTitle>User Settings</CardTitle>
						<CardDescription>Manage your personal account details and preferences.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label htmlFor="displayName">Display Name</Label>
								<Input id="displayName" defaultValue="Current User Name" placeholder="Your Name" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input id="email" type="email" defaultValue="user@example.com" disabled />
							</div>
						</div>

						<Separator className="my-6" />

						<div>
							<Label className="text-base font-medium">Password</Label>
							<CardDescription className="text-sm mb-4">Update your password. Ensure it is strong and unique.</CardDescription>
							<div className="space-y-3 max-w-sm">
								<Input id="currentPassword" type="password" placeholder="Current Password" />
								<Input id="newPassword" type="password" placeholder="New Password" />
								<Input id="confirmNewPassword" type="password" placeholder="Confirm New Password" />
							</div>
							<Button variant="outline" className="mt-4">Change Password</Button>
						</div>

						<Separator className="my-6" />

						<div className="space-y-2 max-w-sm">
							<Label htmlFor="timezone">User Timezone</Label>
							<Select defaultValue="Asia/Jerusalem">
								<SelectTrigger id="timezone">
									<SelectValue placeholder="Select timezone" />
								</SelectTrigger>
								<SelectContent>
									{timezones.map(tz => (
										<SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">For daily summary scheduling and accurate timestamps.</p>
						</div>
					</CardContent>
					<CardFooter>
						<Button>Save User Settings</Button>
					</CardFooter>
				</Card>

				{/* Email Summary Preferences */}
				<Card id="summary-preferences">
					<CardHeader>
						<CardTitle>Email Summary Preferences</CardTitle>
						<CardDescription>Customize how and when you receive your email summaries.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2 max-w-xs">
							<Label htmlFor="summaryTime">Preferred Summary Time</Label>
							<Select defaultValue="08:00">
								<SelectTrigger id="summaryTime">
									<SelectValue placeholder="Select time" />
								</SelectTrigger>
								<SelectContent>
									{summaryTimes.map(time => (
										<SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-3">
							<Label className="text-base font-medium">Summary Delivery Method</Label>
							<div className="flex items-center space-x-3 p-3 border rounded-md">
								<Switch id="deliveryDashboard" defaultChecked />
								<Label htmlFor="deliveryDashboard" className="font-normal flex-1">Dashboard Only</Label>
							</div>
							<div className="flex items-center space-x-3 p-3 border rounded-md">
								<Switch id="deliveryEmail" />
								<Label htmlFor="deliveryEmail" className="font-normal flex-1">Email</Label>
							</div>
							<div className="flex items-center space-x-3 p-3 border rounded-md opacity-60">
								<Switch id="deliveryWhatsapp" disabled />
								<Label htmlFor="deliveryWhatsapp" className="font-normal flex-1">WhatsApp (Coming Soon)</Label>
							</div>
						</div>
						<div className="space-y-3">
							<Label className="text-base font-medium">Default Inbox View Mode</Label>
							<div className="flex items-center space-x-3 p-3 border rounded-md">
								<Switch id="viewUnified" defaultChecked />
								<Label htmlFor="viewUnified" className="font-normal flex-1">All Inboxes Unified</Label>
							</div>
							<div className="flex items-center space-x-3 p-3 border rounded-md">
								<Switch id="viewPerAccount" />
								<Label htmlFor="viewPerAccount" className="font-normal flex-1">One at a Time (Per Account)</Label>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button>Save Summary Preferences</Button>
					</CardFooter>
				</Card>

				{/* Notifications */}
				<Card id="notifications">
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>Choose which notifications you want to receive.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="flex items-center justify-between p-3 border rounded-md">
							<Label htmlFor="notifSummary" className="font-normal">Email Summary Notifications</Label>
							<Switch id="notifSummary" defaultChecked />
						</div>
						<div className="flex items-center justify-between p-3 border rounded-md">
							<Label htmlFor="notifUrgent" className="font-normal">Urgent Alert Emails</Label>
							<Switch id="notifUrgent" defaultChecked />
						</div>
						<div className="flex items-center justify-between p-3 border rounded-md">
							<Label htmlFor="notifPromo" className="font-normal">Unimportant/Promo Alerts</Label>
							<Switch id="notifPromo" />
						</div>
						<div className="flex items-center justify-between p-3 border rounded-md">
							<Label htmlFor="notifFallback" className="font-normal">Digest Fallback Alert (if summary fails)</Label>
							<Switch id="notifFallback" defaultChecked />
						</div>
					</CardContent>
					<CardFooter>
						<Button>Save Notification Settings</Button>
					</CardFooter>
				</Card>

				{/* Inbox Cleanup Preferences */}
				<Card id="cleanup-preferences">
					<CardHeader>
						<CardTitle>Inbox Cleanup Preferences</CardTitle>
						<CardDescription>Manage automated cleanup suggestions and display.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<Label className="text-base font-medium mb-3 block">Auto-suggest unsubscribe for:</Label>
							<div className="space-y-3">
								<div className="flex items-center space-x-3 p-3 border rounded-md">
									<Switch id="cleanupNewsletters" defaultChecked />
									<Label htmlFor="cleanupNewsletters" className="font-normal flex-1">Newsletters</Label>
								</div>
								<div className="flex items-center space-x-3 p-3 border rounded-md">
									<Switch id="cleanupPromotions" defaultChecked />
									<Label htmlFor="cleanupPromotions" className="font-normal flex-1">Promotions</Label>
								</div>
								<div className="flex items-center space-x-3 p-3 border rounded-md">
									<Switch id="cleanupSocial" />
									<Label htmlFor="cleanupSocial" className="font-normal flex-1">Social Updates</Label>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-between p-3 border rounded-md">
							<div className="flex-1">
								<Label htmlFor="inboxHealthScoring" className="font-normal">Inbox Health Scoring</Label>
								<p className="text-xs text-muted-foreground">Show health indicators in dashboard.</p>
							</div>
							<Switch id="inboxHealthScoring" defaultChecked />
						</div>
						<div className="space-y-2 max-w-sm">
							<Label htmlFor="summaryTone">Language/Tone of Summaries</Label>
							<Select defaultValue="Friendly">
								<SelectTrigger id="summaryTone">
									<SelectValue placeholder="Select tone" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Formal">Formal</SelectItem>
									<SelectItem value="Friendly">Friendly</SelectItem>
									<SelectItem value="Minimalist">Minimalist</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
					<CardFooter>
						<Button>Save Cleanup Preferences</Button>
					</CardFooter>
				</Card>

				{/* Privacy and Data */}
				<Card id="privacy-data">
					<CardHeader>
						<CardTitle>Privacy and Data</CardTitle>
						<CardDescription>Manage your data and privacy settings.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button variant="outline" className="w-full justify-start">
							<Download className="w-4 h-4 mr-2" />
							Export My Summaries (Download Data)
						</Button>
						<Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
							<AlertTriangle className="w-4 h-4 mr-2" />
							Request Complete Data Deletion
						</Button>
						<div>
							<Label className="text-base font-medium">Token Access Log</Label>
							<p className="text-sm text-muted-foreground mb-2">Recent access to Gmail API by Sumails will be shown here.</p>
							<div className="mt-2 p-4 bg-muted rounded-md text-sm border">
								<p className="text-muted-foreground">No recent access logs available (UI Placeholder).</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Account Management */}
				<Card id="account-management" className="border-destructive/50">
					<CardHeader>
						<CardTitle className="text-destructive">Account Management</CardTitle>
					</CardHeader>
					<CardContent>
						<Button variant="destructive" className="w-full justify-start">
							<Trash2 className="w-4 h-4 mr-2" />
							Delete My Sumails Account
						</Button>
						<p className="text-xs text-muted-foreground mt-2">This action is irreversible and will delete all your data associated with Sumails, including summaries and settings.</p>
					</CardContent>
				</Card>

			</div>
		</ContentView>
	)
} 