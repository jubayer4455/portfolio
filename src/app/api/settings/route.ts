import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings, updateSiteSettings } from '@/lib/content-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ data: settings }, { headers: NO_CACHE_HEADERS })
  } catch (err) {
    console.error('[settings GET] error:', err)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const updated = await updateSiteSettings(body)
    return NextResponse.json({ data: updated, success: true }, { headers: NO_CACHE_HEADERS })
  } catch (err) {
    console.error('[settings POST] error:', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
