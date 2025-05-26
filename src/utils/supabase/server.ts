import { logger } from '@/lib/logger/default-logger';
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use on the server side
 * This client is used for server-side operations and protected API routes
 * 
 * @returns Supabase client with appropriate permissions
 */
export async function createClient(serviceKey: boolean = false) {
  const cookieStore = await cookies()

  const env = process.env.NODE_ENV;
  console.log(`Supabase client initialized on ${env} environment`);
  const useServiceKey = serviceKey ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  logger.debug('server.ts', 'createClient', `Creating client for ${env} environment`);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    useServiceKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}