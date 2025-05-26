'use client';

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import type {
	LoginSchemaType,
	SignupSchemaType,
	ResetPasswordSchemaType,
	UpdatePasswordSchemaType,
} from '@/schema/auth-schemas'

// Use the Supabase client type
type SupabaseClient = ReturnType<typeof createBrowserClient>

// Define the shape of the context value
interface AuthContextType {
	authUser: any | null
	isLoading: boolean
	isAuthenticated: boolean
	supabase: SupabaseClient
	signUp: (credentials: SignupSchemaType, redirectUrl?: string) => Promise<any>
	signInWithPassword: (credentials: LoginSchemaType) => Promise<any>
	signOut: () => Promise<any>
	sendPasswordResetEmail: (credentials: ResetPasswordSchemaType) => Promise<any>
	updatePassword: (credentials: UpdatePasswordSchemaType) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
}

function AuthProviderInternal({ children }: AuthProviderProps) {
	const supabase = createBrowserClient()
	const [authUser, setAuthUser] = useState<any | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			const { data, error } = await supabase.auth.getSession()
			
			if (error) {
				console.error('Error fetching initial session:', error)
				setAuthUser(null)
			} else {
				setAuthUser(data.session?.user ?? null)
			}
			
			setIsLoading(false)
		}

		getInitialSession()

		// Listen for auth changes
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event: any, session: any) => {
				console.log('Auth event:', event, 'Session:', !!session)
				setAuthUser(session?.user ?? null)
				setIsLoading(false)
			}
		)

		return () => {
			authListener?.subscription.unsubscribe()
		}
	}, [supabase])

	const value: AuthContextType = {
		authUser,
		isLoading,
		isAuthenticated: !!authUser,
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
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Main AuthProvider
export function AuthProvider({ children }: AuthProviderProps) {
	return <AuthProviderInternal>{children}</AuthProviderInternal>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
