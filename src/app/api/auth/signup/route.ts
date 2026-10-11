import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { registerUserAccount } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createServiceClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { displayName, username, email, password } = body

    const cleanName = (displayName || '').trim()
    const cleanUser = (username || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').trim()
    const cleanEmail = (email || '').toLowerCase().trim()

    if (!cleanName || !cleanUser || !cleanEmail || !password) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }

    if (cleanUser.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters long.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    // Register user account in primary account store
    const regResult = await registerUserAccount({
      email: cleanEmail,
      username: cleanUser,
      displayName: cleanName,
      password,
    })

    if (!regResult.success || !regResult.account) {
      return NextResponse.json({ error: regResult.error || 'Failed to create account.' }, { status: 409 })
    }

    const account = regResult.account

    // Optional background Supabase signup
    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              display_name: cleanName,
              username: cleanUser,
            },
          },
        })
      } catch (err) {
        console.warn('Background Supabase signup sync:', err)
      }
    }

    // Set active session cookies
    const cookieStore = await cookies()
    cookieStore.set('user_session_id', account.id, { path: '/', maxAge: 60 * 60 * 24 * 7 })
    cookieStore.set('user_session_username', account.username, { path: '/', maxAge: 60 * 60 * 24 * 7 })
    cookieStore.set('user_session_email', account.email, { path: '/', maxAge: 60 * 60 * 24 * 7 })

    return NextResponse.json({
      success: true,
      data: account,
      redirect: '/dashboard',
    })
  } catch (err: any) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: err.message || 'Failed to complete registration.' }, { status: 500 })
  }
}
