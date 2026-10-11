import { NextResponse } from 'next/server'
import { incrementPageViews, getSiteSettings } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const totalViews = await incrementPageViews()
    return NextResponse.json({ success: true, views: totalViews })
  } catch (err: any) {
    console.error('[analytics/visit POST] error:', err)
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ views: settings.total_views || 0 })
  } catch {
    return NextResponse.json({ views: 0 })
  }
}
