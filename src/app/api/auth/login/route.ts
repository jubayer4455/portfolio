import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { authenticateUser } from '@/lib/user-auth'
import { verifyAdminPassword } from '@/lib/admin-auth'

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
    const identifier = (body.email || body.identifier || body.username || '').toLowerCase().trim().replace(/^@+/, '')
    const password = (body.password || '').trim()

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Please enter your email or username and password.' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    // 1. Check Master Admin Credentials
    const isMasterAdmin =
      identifier === 'jubayerahmmed2k@gmail.com' ||
      identifier === 'jubayer'

    if (isMasterAdmin) {
      const isValidAdmin = await verifyAdminPassword(password)
      if (isValidAdmin) {
        cookieStore.set('demo_admin', 'true', { path: '/', maxAge: 60 * 60 * 24 * 7 })
        cookieStore.set('user_session_id', '3c04c4e0-1653-4037-af3b-32b7c5c36a16', { path: '/', maxAge: 60 * 60 * 24 * 7 })
        cookieStore.set('user_session_username', 'jubayer', { path: '/', maxAge: 60 * 60 * 24 * 7 })
        cookieStore.set('user_session_email', 'jubayerahmmed2k@gmail.com', { path: '/', maxAge: 60 * 60 * 24 * 7 })
        return NextResponse.json({
          success: true,
          redirect: '/admin',
        })
      }
    }

    // 2. Local Account Authentication (Primary & Instant)
    const authResult = authenticateUser(identifier, password)
    if (authResult.success && authResult.account) {
      const user = authResult.account
      cookieStore.set('user_session_id', user.id, { path: '/', maxAge: 60 * 60 * 24 * 7 })
      cookieStore.set('user_session_username', user.username, { path: '/', maxAge: 60 * 60 * 24 * 7 })
      cookieStore.set('user_session_email', user.email, { path: '/', maxAge: 60 * 60 * 24 * 7 })

      return NextResponse.json({
        success: true,
        redirect: '/dashboard',
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
        },
      })
    }

    // 3. Fallback: Supabase Auth (if connected and registered through Supabase)
    const supabase = getServiceSupabase()
    if (supabase && identifier.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        })

        if (!error && data.user) {
          const username = (data.user.user_metadata?.username || identifier.split('@')[0]).toLowerCase()
          cookieStore.set('user_session_id', data.user.id, { path: '/', maxAge: 60 * 60 * 24 * 7 })
          cookieStore.set('user_session_username', username, { path: '/', maxAge: 60 * 60 * 24 * 7 })
          cookieStore.set('user_session_email', identifier, { path: '/', maxAge: 60 * 60 * 24 * 7 })

          return NextResponse.json({
            success: true,
            redirect: '/dashboard',
          })
        }
      } catch (err) {
        console.warn('Supabase fallback login:', err)
      }
    }

    // Return friendly error message
    return NextResponse.json(
      {
        error: authResult.error || 'Invalid credentials. Please verify your email/username and password.',
      },
      { status: 401 }
    )
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message || 'Server error during sign in.' }, { status: 500 })
  }
}
