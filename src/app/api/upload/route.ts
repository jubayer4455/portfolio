import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const MAX_SIZE_BYTES = 25 * 1024 * 1024 // 25MB

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

export async function POST(req: NextRequest) {
  // Check auth: either Supabase user or demo_admin cookie
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_admin')?.value === 'true'
  const sessionUser = cookieStore.get('user_session_username')?.value
  const sessionEmail = cookieStore.get('user_session_email')?.value

  const isAuthenticated =
    isDemo ||
    sessionUser === 'admin' ||
    sessionUser === 'jubayer' ||
    sessionEmail === 'admin@portfolio.com' ||
    sessionEmail === 'jubayerahmmed2k@gmail.com'

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized. Please login as admin.' }, { status: 401 })
  }

  let buffer: Buffer
  let fileName = 'upload.jpg'
  let rawType = 'image/jpeg'

  const contentTypeHeader = req.headers.get('content-type') || ''

  // 1. Handle JSON Base64 upload (direct fallback from mobile)
  if (contentTypeHeader.includes('application/json')) {
    try {
      const json = await req.json()
      const dataUrl = json.dataUrl || json.base64 || ''
      fileName = json.fileName || 'upload.jpg'

      if (!dataUrl) {
        return NextResponse.json({ error: 'No image data provided.' }, { status: 400 })
      }

      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        rawType = match[1]
        buffer = Buffer.from(match[2], 'base64')
      } else {
        buffer = Buffer.from(dataUrl, 'base64')
      }
    } catch {
      return NextResponse.json({ error: 'Invalid JSON upload body.' }, { status: 400 })
    }
  } else {
    // 2. Handle standard FormData upload
    let formData: FormData
    try {
      formData = await req.formData()
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to read form data: ' + err.message }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data.' }, { status: 422 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE_BYTES / 1024 / 1024}MB.` },
        { status: 422 }
      )
    }

    fileName = file.name || 'upload.jpg'
    rawType = (file.type || '').toLowerCase().trim().split(';')[0]
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  }

  // Normalize image types for Supabase Storage
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
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
          }
        )
      } else {
        console.warn('Supabase storage upload returned error:', uploadError)
      }
    } catch (e) {
      console.warn('Supabase storage exception:', e)
    }
  }

  // 2. Fallback: If buffer is within 1.5MB, convert to safe Data URL (guaranteed never to 404 or turn black on Vercel)
  if (buffer.length <= 1.5 * 1024 * 1024) {
    const dataUrl = `data:${storageContentType};base64,${buffer.toString('base64')}`
    return NextResponse.json(
      {
        success: true,
        storagePath: `data/${uniqueFilename}`,
        publicUrl: dataUrl,
        url: dataUrl,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    )
  }

  // 3. Local filesystem fallback (local dev only)
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
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    )
  } catch (err: any) {
    console.error('Local fallback failed:', err)
    return NextResponse.json(
      { error: 'Failed to upload photo. Please check image format and size.' },
      { status: 500 }
    )
  }
}
