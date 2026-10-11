import { NextRequest, NextResponse } from 'next/server'
import { incrementPhotoLike } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: 'Missing photo ID' }, { status: 400 })
    }

    const newLikes = await incrementPhotoLike(id)
    return NextResponse.json({ success: true, likes: newLikes })
  } catch (err: any) {
    console.error('[gallery/[id]/like POST] error:', err)
    return NextResponse.json({ error: 'Failed to record like' }, { status: 500 })
  }
}
