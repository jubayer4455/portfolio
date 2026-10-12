import { NextRequest, NextResponse } from 'next/server'
import { getSocialProfiles, saveSocialProfiles, type SocialProfileData } from '@/lib/content-store'
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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createServiceClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

// GET — fetch social profiles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get('all') === 'true'

    const profiles = await getSocialProfiles()
    const filtered = showAll ? profiles : profiles.filter((p) => p.is_visible)

    return NextResponse.json({ data: filtered }, { headers: NO_CACHE_HEADERS })
  } catch (err) {
    console.error('[social GET] error:', err)
    return NextResponse.json({ error: 'Failed to fetch social profiles' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

// POST — create new social profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { platform, display_label, handle, profile_url, icon_name, color, is_visible } = body

    if (!platform || !display_label || !profile_url) {
      return NextResponse.json(
        { error: 'Platform, label, and profile URL are required.' },
        { status: 422 }
      )
    }

    const currentProfiles = await getSocialProfiles()
    const newProfile: SocialProfileData = {
      id: String(Date.now()),
      platform: String(platform),
      display_label: String(display_label),
      handle: handle ? String(handle) : `@${platform.toLowerCase()}`,
      profile_url: String(profile_url),
      icon_name: icon_name ? String(icon_name) : 'Globe',
      color: color ? String(color) : '#F97316',
      sort_order: currentProfiles.length + 1,
      is_visible: is_visible !== undefined ? Boolean(is_visible) : true,
    }

    const updatedList = [...currentProfiles, newProfile]
    await saveSocialProfiles(updatedList)

    // Sync with Supabase if configured
    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase.from('social_profiles').insert({
          platform: newProfile.platform,
          display_label: newProfile.display_label,
          profile_url: newProfile.profile_url,
          icon_name: newProfile.icon_name,
          sort_order: newProfile.sort_order,
          is_visible: newProfile.is_visible,
        })
      } catch (e) {
        console.warn('Supabase social insert sync failed:', e)
      }
    }

    return NextResponse.json({ data: newProfile, success: true }, { status: 201, headers: NO_CACHE_HEADERS })
  } catch (err) {
    console.error('[social POST] error:', err)
    return NextResponse.json({ error: 'Failed to create social profile' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

// PUT — update/reorder entire list
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected an array of profiles' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    await saveSocialProfiles(body as SocialProfileData[])
    return NextResponse.json({ data: body, success: true }, { headers: NO_CACHE_HEADERS })
  } catch (err) {
    console.error('[social PUT] error:', err)
    return NextResponse.json({ error: 'Failed to update social profiles' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
