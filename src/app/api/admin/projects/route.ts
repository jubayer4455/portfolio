import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getFeaturedProjects,
  saveFeaturedProject,
  deleteFeaturedProject,
  getDomainLogoUrl,
  type FeaturedProject
} from '@/lib/projects-store'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
}

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_admin')?.value === 'true'
  const sessionUser = cookieStore.get('user_session_username')?.value
  const sessionEmail = cookieStore.get('user_session_email')?.value
  if (isDemo || sessionUser === 'jubayer' || sessionEmail === 'jubayerahmmed2k@gmail.com') return true

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
    return !!user && user.email?.toLowerCase() === 'jubayerahmmed2k@gmail.com'
  } catch {
    return false
  }
}

// GET all projects (public or admin)
export async function GET() {
  const projects = await getFeaturedProjects()
  return NextResponse.json({ success: true, data: projects }, { headers: NO_CACHE_HEADERS })
}

// POST create new project (admin protected)
export async function POST(req: NextRequest) {
  const isAuthed = await checkAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
  }

  try {
    const body = await req.json()
    const { title, url, description, category, tags, preview_image, is_featured, logo_url } = body

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    const saved = await saveFeaturedProject({
      title,
      url,
      description,
      category,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      preview_image,
      logo_url: logo_url || getDomainLogoUrl(url),
      is_featured: is_featured !== false,
    })

    return NextResponse.json({ success: true, data: saved }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save project' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

// PATCH update existing project (admin protected)
export async function PATCH(req: NextRequest) {
  const isAuthed = await checkAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
  }

  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    }

    const saved = await saveFeaturedProject(body)
    return NextResponse.json({ success: true, data: saved }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update project' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

// DELETE project (admin protected)
export async function DELETE(req: NextRequest) {
  const isAuthed = await checkAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    const ok = await deleteFeaturedProject(id)
    return NextResponse.json({ success: ok }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete project' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
