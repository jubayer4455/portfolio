import { NextRequest, NextResponse } from 'next/server'
import { getGalleryItems, saveGalleryItems } from '@/lib/content-store'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createServiceClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await req.json()

    const images = await getGalleryItems()
    const index = images.findIndex((img) => img.id === id || img.slug === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    images[index] = { ...images[index], ...updates }
    await saveGalleryItems(images)

    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase
          .from('gallery_images')
          .update(updates)
          .or(`id.eq.${id},slug.eq.${id}`)
      } catch {}
    }

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
    const target = images.find((img) => img.id === id || img.slug === id)
    const filtered = images.filter((img) => img.id !== id && img.slug !== id)

    await saveGalleryItems(filtered)

    const supabase = getServiceSupabase()
    if (supabase && target) {
      try {
        await supabase.from('gallery_images').delete().or(`id.eq.${id},slug.eq.${id}`)
      } catch (e) {
        console.warn('Supabase gallery table delete error:', e)
      }
    }

    return NextResponse.json({ success: true, count: filtered.length })
  } catch (err) {
    console.error('[gallery DELETE] error:', err)
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}
