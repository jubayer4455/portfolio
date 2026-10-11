import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllUserBios, deleteUserBio } from '@/lib/builder-store'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bios = await getAllUserBios()
  return NextResponse.json({ success: true, data: bios })
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
      return NextResponse.json({ error: 'Missing user bio id' }, { status: 400 })
    }

    await deleteUserBio(id)
    return NextResponse.json({ success: true, message: 'User bio deleted successfully.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user bio' }, { status: 500 })
  }
}
