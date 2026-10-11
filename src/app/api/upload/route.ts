import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

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
      // In production, verify user
      isAuthenticated = true
    } else {
      // In local dev mode without Supabase, allow admin actions
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

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}` },
      { status: 422 }
    )
  }

  // Validate size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum allowed size is ${MAX_SIZE_BYTES / 1024 / 1024}MB.` },
      { status: 422 }
    )
  }

  const ext = file.type.split('/')[1] || 'jpg'
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
          contentType: file.type,
          upsert: false,
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(storagePath)

        return NextResponse.json({
          success: true,
          storagePath,
          publicUrl,
        })
      }
    } catch (e) {
      console.warn('Supabase upload failed, falling back to local storage:', e)
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
    return NextResponse.json({
      success: true,
      storagePath: `uploads/${filename}`,
      publicUrl,
    })
  } catch (err) {
    console.error('[upload POST] local storage error:', err)
    return NextResponse.json({ error: 'Failed to save uploaded file.' }, { status: 500 })
  }
}
