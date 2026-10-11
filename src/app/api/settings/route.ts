import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings, updateSiteSettings } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ data: settings })
  } catch (err) {
    console.error('[settings GET] error:', err)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const updated = await updateSiteSettings(body)
    return NextResponse.json({ data: updated, success: true })
  } catch (err) {
    console.error('[settings POST] error:', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
