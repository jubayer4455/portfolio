import { NextRequest, NextResponse } from 'next/server'
import { getSocialProfiles, saveSocialProfiles } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await req.json()

    const profiles = await getSocialProfiles()
    const index = profiles.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    profiles[index] = { ...profiles[index], ...updates }
    await saveSocialProfiles(profiles)

    return NextResponse.json({ data: profiles[index], success: true })
  } catch (err) {
    console.error('[social PATCH] error:', err)
    return NextResponse.json({ error: 'Failed to update social profile' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const profiles = await getSocialProfiles()
    const filtered = profiles.filter((p) => p.id !== id)

    await saveSocialProfiles(filtered)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[social DELETE] error:', err)
    return NextResponse.json({ error: 'Failed to delete social profile' }, { status: 500 })
  }
}
