import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh Supabase session and get supabase + response
  const { supabase, supabaseResponse } = await updateSession(request)

  // Protect /admin/** routes
  if (pathname.startsWith('/admin')) {
    // Allow /admin/login to pass through without auth check
    if (pathname === '/admin/login') {
      return supabaseResponse
    }

    // Allow master admin cookie during local development/auth
    const demoAdmin = request.cookies.get('demo_admin')?.value === 'true'
    const sessionUser = request.cookies.get('user_session_username')?.value
    const sessionEmail = request.cookies.get('user_session_email')?.value
    if (demoAdmin || sessionUser === 'admin' || sessionEmail === 'admin@portfolio.com') {
      return supabaseResponse
    }

    if (!supabase) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      //
    }

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images.
     * Run middleware on all pages and API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
