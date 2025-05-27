'use client';

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase'
import type {
	LoginSchemaType,
	SignupSchemaType,
	ResetPasswordSchemaType,
	UpdatePasswordSchemaType,
} from '@/schema/auth-schemas'

/**
 * Auth Context Provider that manages user authentication and subscription data
 * 
 * Features:
 * - User authentication state
 * - User subscription data with automatic fetching
 * - Functions to refetch subscription data
 * - Loading states for both auth and subscription
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     authUser, 
 *     userSubscription, 
 *     isSubscriptionLoading,
 *     refetchSubscription 
 *   } = useAuth()
 *   
 *   if (userSubscription?.status === 'active') {
 *     return <div>Premium user with {userSubscription.plan_name} plan</div>
 *   }
 *   
 *   return <div>Free user</div>
 * }
 * ```
 */

// Use the Supabase client type
type SupabaseClient = ReturnType<typeof createBrowserClient>

// Subscription table type from Supabase
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

// Define the shape of the context value
interface AuthContextType {
	authUser: any | null
	isLoading: boolean
	isAuthenticated: boolean
	userSubscription: Subscription | null
	isSubscriptionLoading: boolean
	supabase: SupabaseClient
	signUp: (credentials: SignupSchemaType, redirectUrl?: string) => Promise<any>
	signInWithPassword: (credentials: LoginSchemaType) => Promise<any>
	signOut: () => Promise<any>
	sendPasswordResetEmail: (credentials: ResetPasswordSchemaType) => Promise<any>
	updatePassword: (credentials: UpdatePasswordSchemaType) => Promise<any>
	refetchSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Export the context for use in custom hooks
export { AuthContext }

interface AuthProviderProps {
	children: ReactNode
}

function AuthProviderInternal({ children }: AuthProviderProps) {
	const supabase = createBrowserClient()
	const [authUser, setAuthUser] = useState<any | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [userSubscription, setUserSubscription] = useState<Subscription | null>(null)
	const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)

	// Function to fetch subscription data
	const fetchSubscriptionData = async (userId: string) => {
		setIsSubscriptionLoading(true)
		try {
			// Import settingsService instance
			const { settingsService } = await import('@/lib/services/settings')
			const subscriptionData = await settingsService.getSubscriptionData(userId)
			setUserSubscription(subscriptionData)
		} catch (error) {
			console.error('Error fetching subscription data:', error)
			setUserSubscription(null)
		} finally {
			setIsSubscriptionLoading(false)
		}
	}

	// Function to refetch subscription data
	const refetchSubscription = async () => {
		if (authUser?.id) {
			await fetchSubscriptionData(authUser.id)
		}
	}

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			const { data, error } = await supabase.auth.getSession()
			
			if (error) {
				console.error('Error fetching initial session:', error)
				setAuthUser(null)
			} else {
				const user = data.session?.user ?? null
				setAuthUser(user)
				
				// Fetch subscription data if user is authenticated
				if (user?.id) {
					await fetchSubscriptionData(user.id)
				}
			}
			
			setIsLoading(false)
			setIsInitialized(true)
		}

		getInitialSession()

		// Listen for auth changes
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event: any, session: any) => {
				console.log('Auth event:', event, 'Session:', !!session)
				
				// Don't set loading to true for token refresh events if already initialized
				if (isInitialized && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN')) {
					const user = session?.user ?? null
					setAuthUser(user)
					
					// Fetch subscription data if user is authenticated
					if (user?.id) {
						await fetchSubscriptionData(user.id)
					} else {
						// Clear subscription data if user is not authenticated
						setUserSubscription(null)
					}
					return
				}
				
				const user = session?.user ?? null
				setAuthUser(user)
				
				// Fetch subscription data if user is authenticated
				if (user?.id) {
					await fetchSubscriptionData(user.id)
				} else {
					// Clear subscription data if user is not authenticated
					setUserSubscription(null)
				}
				
				setIsLoading(false)
				setIsInitialized(true)
			}
		)

		return () => {
			authListener?.subscription.unsubscribe()
		}
	}, [supabase, isInitialized])

	const value: AuthContextType = {
		authUser,
		isLoading,
		isAuthenticated: !!authUser,
		userSubscription,
		isSubscriptionLoading,
		supabase,
		signUp: (credentials, redirectUrl) => {
			return supabase.auth.signUp({
				email: credentials.email,
				password: credentials.password,
				options: {
					emailRedirectTo: redirectUrl,
				},
			})
		},
		signInWithPassword: (credentials) =>
			supabase.auth.signInWithPassword({
				email: credentials.email,
				password: credentials.password,
			}),
		signOut: () => supabase.auth.signOut(),
		sendPasswordResetEmail: (credentials) =>
			supabase.auth.resetPasswordForEmail(credentials.email),
		updatePassword: (credentials) => 
			supabase.auth.updateUser({ password: credentials.password }),
		refetchSubscription,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Main AuthProvider
export function AuthProvider({ children }: AuthProviderProps) {
	return <AuthProviderInternal>{children}</AuthProviderInternal>
}