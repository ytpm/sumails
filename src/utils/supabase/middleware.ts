import { logger } from '@/lib/logger/default-logger'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import PATHS, { AUTH_REDIRECT_ROUTES, PROTECTED_ROUTES } from '@/utils/paths'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  logger.debug('middleware', 'updateSession', `Middleware call on path: ${request.nextUrl.pathname}`)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Restrict /auth/check-email to only users with the justSignedUp cookie
  if (pathname.startsWith('/auth/check-email') && !request.cookies.get('justSignedUp')) {
    logger.debug('middleware', 'updateSession', 'Redirecting unauthorized user from /auth/check-email to login')
    const url = request.nextUrl.clone()
    url.pathname = PATHS.AUTH.LOGIN
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access auth routes, redirect to home
  if (
    user &&
    AUTH_REDIRECT_ROUTES.some(route => {
      const match = pathname === route;
      if (match) {
        logger.debug('middleware', 'updateSession', `MATCHED: pathname (${pathname}) === AUTH_REDIRECT_ROUTE (${route})`);
      }
      return match;
    })
  ) {
    logger.debug('middleware', 'updateSession', `Redirecting logged-in user from auth route ${pathname} to home because it matched an AUTH_REDIRECT_ROUTE.`);
    const url = request.nextUrl.clone()
    url.pathname = PATHS.HOME
    return NextResponse.redirect(url)
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  if (!user && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    logger.debug('middleware', 'updateSession', 'Redirecting unauthenticated user to login for protected route')
    const url = request.nextUrl.clone()
    url.pathname = PATHS.AUTH.LOGIN
    return NextResponse.redirect(url)
  }
  
  return supabaseResponse
}
