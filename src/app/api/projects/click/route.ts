import { NextRequest, NextResponse } from 'next/server'
import { incrementProjectClicks } from '@/lib/projects-store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    const clicks = await incrementProjectClicks(id)
    return NextResponse.json({ success: true, clicks })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
