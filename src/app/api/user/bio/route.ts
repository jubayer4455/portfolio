import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import {
  getUserBioByUserId,
  getUserBioByUsername,
  saveUserBio,
  readAllUserBios,
  type UserBioData
} from '@/lib/builder-store'

export const dynamic = 'force-dynamic'

async function getAuthUser(req: NextRequest) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('user_session_id')?.value
  const sessionUser = cookieStore.get('user_session_username')?.value
  const sessionEmail = cookieStore.get('user_session_email')?.value

  if (sessionId && sessionUser) {
    return {
      id: sessionId,
      email: sessionEmail || `${sessionUser}@bio.user`,
      username: sessionUser,
    }
  }

  const demoUser = cookieStore.get('demo_user')?.value === 'true'
  const demoUsername = cookieStore.get('demo_username')?.value

  if (demoUser) {
    return {
      id: 'demo-user-123',
      email: 'demo@bio.user',
      username: demoUsername || 'sarah',
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      return {
        id: user.id,
        email: user.email,
        username: (user.user_metadata?.username || user.email?.split('@')[0] || 'user').toLowerCase(),
      }
    }
  } catch {}

  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const usernameParam = searchParams.get('username')
  const userIdParam = searchParams.get('user_id')

  if (usernameParam) {
    const bio = await getUserBioByUsername(usernameParam)
    if (bio) return NextResponse.json({ success: true, data: bio })
    return NextResponse.json({ error: 'Bio not found' }, { status: 404 })
  }

  if (userIdParam) {
    const bio = await getUserBioByUserId(userIdParam)
    if (bio) return NextResponse.json({ success: true, data: bio })
  }

  // Check auth user
  const authUser = await getAuthUser(req)
  if (authUser) {
    let bio = await getUserBioByUserId(authUser.id)
    if (!bio) {
      bio = await getUserBioByUsername(authUser.username)
    }
    if (bio) {
      return NextResponse.json({ success: true, data: bio, user: authUser })
    }

    // Default starter template if not yet initialized
    const starter: UserBioData = {
      id: `bio-${Date.now()}`,
      user_id: authUser.id,
      username: authUser.username,
      display_name: authUser.username.toUpperCase(),
      tagline: 'Welcome to my official 3D Link-in-Bio profile!',
      bio: 'Personal link hub, photos, and socials in one place.',
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80`,
      location: 'Bangladesh',
      bg_3d_style: 'particles',
      status_badge: '🟢 Open for connections',
      layout_style: 'bento',
      social_links: [
        { id: '1', platform: 'Instagram', display_label: `@${authUser.username}`, profile_url: 'https://instagram.com' },
        { id: '2', platform: 'Facebook', display_label: authUser.username, profile_url: 'https://facebook.com' },
      ],
      photos: [],
      theme: 'orange',
      font_family: 'sans',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const saved = await saveUserBio(starter)
    return NextResponse.json({ success: true, data: saved, user: authUser })
  }

  return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authUser = await getAuthUser(req)

    const userId = body.user_id || authUser?.id || `user-${Date.now()}`
    let username = (body.username || authUser?.username || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, '')

    if (!username) {
      return NextResponse.json({ error: 'Valid username is required' }, { status: 400 })
    }

    // Check if username taken by another user
    const all = readAllUserBios()
    const conflict = all.find((b) => b.username.toLowerCase() === username && b.user_id !== userId)
    if (conflict) {
      return NextResponse.json({ error: `Username @${username} is already taken. Please choose another.` }, { status: 409 })
    }

    const saved = await saveUserBio({
      ...body,
      user_id: userId,
      username,
    })

    return NextResponse.json({ success: true, data: saved })
  } catch (err: any) {
    console.error('Error saving user bio:', err)
    return NextResponse.json({ error: err.message || 'Failed to save user bio' }, { status: 500 })
  }
}
