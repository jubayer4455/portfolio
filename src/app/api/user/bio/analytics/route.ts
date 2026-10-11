import { NextRequest, NextResponse } from 'next/server'
import { incrementBioViews, incrementBioClicks } from '@/lib/builder-store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, type, platform } = body

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    if (type === 'view') {
      const totalViews = await incrementBioViews(username)
      return NextResponse.json({ success: true, views: totalViews })
    }

    if (type === 'click') {
      const totalClicks = await incrementBioClicks(username, platform)
      return NextResponse.json({ success: true, clicks: totalClicks })
    }

    return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analytics failed' }, { status: 500 })
  }
}
