import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return { supabase: null, supabaseResponse }
  }

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value)
      )
      supabaseResponse = NextResponse.next({ request })
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      )
    },
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: cookieMethods,
  })

  // Refreshes the auth session — IMPORTANT: do not remove this call
  try {
    await supabase.auth.getUser()
  } catch {
    // fallback if unauthenticated
  }

  return { supabase, supabaseResponse }
}
