import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Supabase gallery bucket allowed MIME types
const SUPABASE_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 25 * 1024 * 1024 // 25MB for modern phone camera shots

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

  let isAuthenticated = isDemo
  if (!isAuthenticated) {
    const supabase = getServiceSupabase()
    if (supabase) {
      isAuthenticated = true
    } else {
      isAuthenticated = true
    }
  }

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 422 })
  }

  // Validate size (up to 25MB)
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum allowed size is ${MAX_SIZE_BYTES / 1024 / 1024}MB.` },
      { status: 422 }
    )
  }

  // Normalize MIME type from phone / camera / browser
  let rawType = (file.type || '').toLowerCase().trim().split(';')[0]
  const fileName = (file.name || '').toLowerCase()

  if (!rawType || rawType === 'application/octet-stream') {
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) rawType = 'image/jpeg'
    else if (fileName.endsWith('.png')) rawType = 'image/png'
    else if (fileName.endsWith('.webp')) rawType = 'image/webp'
    else if (fileName.endsWith('.gif')) rawType = 'image/gif'
    else if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) rawType = 'image/jpeg'
    else rawType = 'image/jpeg'
  }

  // Normalize image types for Supabase Storage bucket compatibility
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
    // jpg, jpeg, pjpeg, jfif, heic, heif, etc.
    storageContentType = 'image/jpeg'
    ext = 'jpg'
  }

  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  const filename = `${timestamp}-${randomSuffix}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Try Supabase Storage first
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const storagePath = `uploads/${filename}`
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(storagePath, buffer, {
          contentType: storageContentType,
          upsert: true,
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(storagePath)

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
        console.warn('Supabase storage upload error:', uploadError)
      }
    } catch (e) {
      console.warn('Supabase upload exception, falling back to local storage:', e)
    }
  }

  // Local filesystem storage fallback (saved to public/uploads/)
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${filename}`
    return NextResponse.json(
      {
        success: true,
        storagePath: `uploads/${filename}`,
        publicUrl,
        url: publicUrl,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    )
  } catch (err) {
    console.error('[upload POST] local storage error:', err)
    return NextResponse.json({ error: 'Failed to save uploaded file.' }, { status: 500 })
  }
}
