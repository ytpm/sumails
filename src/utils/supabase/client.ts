import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { logger } from '@/lib/logger/default-logger';

/**
 * Creates a Supabase client for use in the browser
 * This client is used for client-side operations like authentication
 */
export const createClient = () => {

  const env = process.env.NODE_ENV;
  logger.debug('client.ts', 'createClient', `Creating client for ${env} environment`);

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 