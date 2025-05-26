const PATHS = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/signup',
		RESET_PASSWORD: '/auth/reset-password',
	},
	HOME: '/',
	DASHBOARD: {
		ROOT: '/dashboard',
		TODAY_SUMMARY: '/dashboard/today-summary',
		SUMMARY: '/dashboard/summary',
		EMAIL_ANALYTICS: '/dashboard/email-analytics',
		EMAIL_HEALTH: '/dashboard/email-health',
		CONNECTED_EMAILS: '/dashboard/connected-emails',
		SUBSCRIPTION: '/dashboard/subscription',
		SETTINGS: '/dashboard/settings'
	}
} as const

// Protected routes
export const PROTECTED_ROUTES = [
	PATHS.DASHBOARD.ROOT,
	PATHS.DASHBOARD.SETTINGS,
	PATHS.DASHBOARD.SUBSCRIPTION,
]

// Auth redirect routes
export const AUTH_REDIRECT_ROUTES = [
	PATHS.AUTH.LOGIN,
	PATHS.AUTH.REGISTER,
	PATHS.AUTH.RESET_PASSWORD,
	// PATHS.AUTH.UPDATE_PASSWORD, // Removed to allow access for password recovery
]

export default PATHS 