import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings, updateSiteSettings } from '@/lib/content-store'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
}

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

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ data: settings }, { headers: NO_CACHE_HEADERS })
  } catch (err) {
    console.error('[admin/profile GET] error:', err)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      first_name,
      last_name,
      tagline,
      avatar_url,
      verified,
      location,
      quote_or_motto,
      bio_intro,
      bio_full_p1,
      bio_full_p2,
      new_email,
      new_password,
    } = body

    // 1. Update site profile settings
    const fullName = `${first_name || 'Abdul Al'} ${last_name || 'Jubayer'}`.trim()
    const updatedSettings = await updateSiteSettings({
      site_name: fullName,
      first_name: first_name || 'Abdul Al',
      last_name: last_name || 'Jubayer',
      tagline: tagline || 'Visual Creator & Life Storyteller',
      avatar_url: avatar_url || undefined,
      verified: verified !== undefined ? !!verified : true,
      location: location || 'Dhaka, Bangladesh',
      quote_or_motto: quote_or_motto || '',
      bio_intro: bio_intro || '',
      bio_full_p1: bio_full_p1 || '',
      bio_full_p2: bio_full_p2 || '',
      seo_title: `${fullName} — Official Bio & Social Hub`,
    })

    // 2. If password or email change was requested, update in Supabase Auth
    const supabase = getServiceSupabase()
    let authUpdated = false
    let authMessage = ''

    if (supabase && (new_password || new_email)) {
      try {
        // List users to find the admin user
        const { data: usersData } = await supabase.auth.admin.listUsers()
        const adminUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === 'jubayerahmmed2k@gmail.com' || (new_email && u.email?.toLowerCase() === new_email.toLowerCase())
        )

        if (adminUser) {
          const updateData: { email?: string; password?: string } = {}
          if (new_password && new_password.trim().length >= 6) {
            updateData.password = new_password.trim()
          }
          if (new_email && new_email.trim().includes('@')) {
            updateData.email = new_email.trim()
          }

          if (Object.keys(updateData).length > 0) {
            const { error: authErr } = await supabase.auth.admin.updateUserById(
              adminUser.id,
              updateData
            )
            if (authErr) {
              console.warn('Auth update error:', authErr.message)
              authMessage = ` (Auth warning: ${authErr.message})`
            } else {
              authUpdated = true
            }
          }
        }
      } catch (authErr) {
        console.warn('Could not update Supabase Auth credentials:', authErr)
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedSettings,
        authUpdated,
        message: `Profile updated successfully!${authMessage}`,
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (err: any) {
    console.error('[admin/profile POST] error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update profile' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
