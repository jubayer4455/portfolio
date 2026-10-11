import { NextRequest, NextResponse } from 'next/server'
import { getGalleryItems, saveGalleryItems } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await req.json()

    const images = await getGalleryItems()
    const index = images.findIndex((img) => img.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    images[index] = { ...images[index], ...updates }
    await saveGalleryItems(images)

    return NextResponse.json({ data: images[index], success: true })
  } catch (err) {
    console.error('[gallery PATCH] error:', err)
    return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const images = await getGalleryItems()
    const filtered = images.filter((img) => img.id !== id)

    await saveGalleryItems(filtered)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[gallery DELETE] error:', err)
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}
