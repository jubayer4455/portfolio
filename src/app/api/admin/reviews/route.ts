import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllReviews, setReviewApproval, deleteReview } from '@/lib/builder-store'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_admin')?.value === 'true'
  if (isDemo) return true

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
    return !!user
  } catch {
    return false
  }
}

export async function GET() {
  const isAuthed = await checkAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noCacheHeaders })
  }

  const all = await getAllReviews()
  return NextResponse.json({ success: true, data: all }, { headers: noCacheHeaders })
}

export async function PATCH(req: NextRequest) {
  const isAuthed = await checkAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, is_approved } = body

    if (!id || typeof is_approved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    await setReviewApproval(id, is_approved)
    return NextResponse.json({ success: true, message: `Review ${is_approved ? 'approved' : 'hidden'}.` })
  } catch (err: any) {
    console.error('Error updating review status:', err)
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthed = await checkAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing review id' }, { status: 400 })
    }

    await deleteReview(id)
    return NextResponse.json({ success: true, message: 'Review deleted.' })
  } catch (err: any) {
    console.error('Error deleting review:', err)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
