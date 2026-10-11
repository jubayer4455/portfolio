import { NextRequest, NextResponse } from 'next/server'
import { incrementSocialClick } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { id, platform } = await req.json()
    const target = id || platform
    if (!target) {
      return NextResponse.json({ error: 'Missing profile identifier' }, { status: 400 })
    }

    const newCount = await incrementSocialClick(target)
    return NextResponse.json({ success: true, count: newCount })
  } catch (err: any) {
    console.error('[analytics/click POST] error:', err)
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 })
  }
}
