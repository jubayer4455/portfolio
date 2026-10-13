import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const MAX_SIZE_BYTES = 25 * 1024 * 1024 // 25MB

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createServiceClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  let buffer: Buffer
  let fileName = 'photo.jpg'
  let rawType = 'image/jpeg'

  const contentTypeHeader = req.headers.get('content-type') || ''

  try {
    // 1. Handle JSON Base64 upload (resilient mobile fallback)
    if (contentTypeHeader.includes('application/json')) {
      const json = await req.json()
      const dataUrl = json.dataUrl || json.base64 || ''
      fileName = json.fileName || 'photo.jpg'

      if (!dataUrl) {
        return NextResponse.json(
          { error: 'No image data provided in JSON body.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        )
      }

      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        rawType = match[1]
        buffer = Buffer.from(match[2], 'base64')
      } else {
        buffer = Buffer.from(dataUrl, 'base64')
      }
    } else {
      // 2. Handle standard FormData upload
      let formData: FormData
      try {
        formData = await req.formData()
      } catch (err: any) {
        return NextResponse.json(
          { error: 'Failed to read upload form data: ' + err.message },
          { status: 400, headers: NO_CACHE_HEADERS }
        )
      }

      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json(
          { error: 'No photo provided in upload.' },
          { status: 422, headers: NO_CACHE_HEADERS }
        )
      }

      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Photo too large. Maximum size is ${MAX_SIZE_BYTES / 1024 / 1024}MB.` },
          { status: 422, headers: NO_CACHE_HEADERS }
        )
      }

      fileName = file.name || 'photo.jpg'
      rawType = (file.type || '').toLowerCase().trim().split(';')[0]
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    }
  } catch (err: any) {
    console.error('[Upload Request Parse Error]:', err)
    return NextResponse.json(
      { error: 'Invalid upload request payload: ' + (err?.message || 'Unknown error') },
      { status: 400, headers: NO_CACHE_HEADERS }
    )
  }

  // Normalize image types for Supabase Storage (strictly allowed MIME types only)
  const lowerName = fileName.toLowerCase()
  if (!rawType || rawType === 'application/octet-stream') {
    if (lowerName.endsWith('.png')) rawType = 'image/png'
    else if (lowerName.endsWith('.webp')) rawType = 'image/webp'
    else if (lowerName.endsWith('.gif')) rawType = 'image/gif'
    else rawType = 'image/jpeg'
  }

  let storageContentType = 'image/jpeg'
  let ext = 'jpg'

  if (rawType.includes('png')) {
    storageContentType = 'image/png'
    ext = 'png'
  } else if (rawType.includes('webp')) {
    storageContentType = 'image/webp'
    ext = 'webp'
  } else if (rawType.includes('gif')) {
    storageContentType = 'image/gif'
    ext = 'gif'
  } else {
    storageContentType = 'image/jpeg'
    ext = 'jpg'
  }

  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  const uniqueFilename = `${timestamp}-${randomSuffix}.${ext}`
  const storagePath = `uploads/${uniqueFilename}`

  // 1. Try Supabase Storage
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(storagePath, buffer, {
          contentType: storageContentType,
          upsert: true,
        })

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('gallery').getPublicUrl(storagePath)

        return NextResponse.json(
          {
            success: true,
            storagePath,
            publicUrl,
            url: publicUrl,
          },
          { headers: NO_CACHE_HEADERS }
        )
      } else {
        console.warn('Supabase storage upload error:', uploadError)
      }
    } catch (e) {
      console.warn('Supabase storage upload exception:', e)
    }
  }

  // 2. Safe Fallback: Base64 Data URL (guaranteed never to 404 or fail on Vercel)
  if (buffer.length <= 4 * 1024 * 1024) {
    const dataUrl = `data:${storageContentType};base64,${buffer.toString('base64')}`
    return NextResponse.json(
      {
        success: true,
        storagePath: `data/${uniqueFilename}`,
        publicUrl: dataUrl,
        url: dataUrl,
      },
      { headers: NO_CACHE_HEADERS }
    )
  }

  // 3. Local filesystem fallback (local development only)
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, uniqueFilename)
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${uniqueFilename}`
    return NextResponse.json(
      {
        success: true,
        storagePath: `uploads/${uniqueFilename}`,
        publicUrl,
        url: publicUrl,
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (fsErr: any) {
    console.warn('Filesystem fallback failed (expected on read-only Vercel):', fsErr)
    // Emergency Data URL even for slightly larger files
    const dataUrl = `data:${storageContentType};base64,${buffer.toString('base64')}`
    return NextResponse.json(
      {
        success: true,
        storagePath: `data/${uniqueFilename}`,
        publicUrl: dataUrl,
        url: dataUrl,
      },
      { headers: NO_CACHE_HEADERS }
    )
  }
}
