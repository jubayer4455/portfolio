import { NextRequest, NextResponse } from 'next/server'
import { getGalleryItems, saveGalleryItems, type GalleryImageData } from '@/lib/content-store'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createServiceClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

// GET — fetch gallery images
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const showAll = searchParams.get('all') === 'true'

    const allImages = await getGalleryItems()
    let filtered = showAll ? allImages : allImages.filter((img) => img.is_public)

    if (category && category !== 'all' && category !== 'All') {
      filtered = filtered.filter(
        (img) => img.category.toLowerCase() === category.toLowerCase()
      )
    }

    return NextResponse.json({ data: filtered })
  } catch (err) {
    console.error('[gallery GET] error:', err)
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 })
  }
}

// POST — create new gallery image
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      category,
      description,
      alt_text,
      caption,
      public_url,
      is_public,
      is_featured,
      width,
      height,
    } = body

    if (!title || !public_url) {
      return NextResponse.json(
        { error: 'Title and image URL are required.' },
        { status: 422 }
      )
    }

    const currentImages = await getGalleryItems()
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now()

    const newImage: GalleryImageData = {
      id: String(Date.now()),
      title: String(title),
      category: category ? String(category) : 'Photography',
      slug,
      description: description ? String(description) : '',
      alt_text: alt_text ? String(alt_text) : String(title),
      caption: caption ? String(caption) : '',
      public_url: String(public_url),
      width: width ? Number(width) : 800,
      height: height ? Number(height) : 600,
      is_public: is_public !== undefined ? Boolean(is_public) : true,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : false,
      sort_order: currentImages.length + 1,
    }

    const updated = [newImage, ...currentImages]
    await saveGalleryItems(updated)

    // Sync with Supabase if configured
    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase.from('gallery_images').insert({
          title: newImage.title,
          slug: newImage.slug,
          description: newImage.description,
          alt_text: newImage.alt_text,
          caption: newImage.caption,
          storage_path: newImage.public_url,
          public_url: newImage.public_url,
          width: newImage.width,
          height: newImage.height,
          is_public: newImage.is_public,
          is_featured: newImage.is_featured,
          sort_order: newImage.sort_order,
        })
      } catch (e) {
        console.warn('Supabase gallery insert sync failed:', e)
      }
    }

    return NextResponse.json({ data: newImage, success: true }, { status: 201 })
  } catch (err) {
    console.error('[gallery POST] error:', err)
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 })
  }
}

// DELETE — bulk clear all gallery images
export async function DELETE() {
  try {
    await saveGalleryItems([])

    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase.from('gallery_images').delete().neq('title', '')
      } catch (e) {
        console.warn('Supabase gallery bulk delete error:', e)
      }
    }

    return NextResponse.json({ success: true, message: 'All gallery images have been cleared.' })
  } catch (err) {
    console.error('[gallery DELETE ALL] error:', err)
    return NextResponse.json({ error: 'Failed to clear gallery images' }, { status: 500 })
  }
}
