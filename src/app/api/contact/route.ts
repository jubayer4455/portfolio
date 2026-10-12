import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { sendContactTelegramAlert } from '@/lib/telegram'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

// Simple in-memory rate limiting (per IP, resets every 60 seconds)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT) return true

  entry.count++
  return false
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

const submissionsFilePath = path.join(process.cwd(), 'src', 'data', 'contact-submissions.json')
const tmpSubmissionsFilePath = path.join(os.tmpdir(), 'contact-submissions.json')

function readLocalSubmissions(): any[] {
  try {
    if (fs.existsSync(tmpSubmissionsFilePath)) {
      return JSON.parse(fs.readFileSync(tmpSubmissionsFilePath, 'utf8'))
    }
    if (fs.existsSync(submissionsFilePath)) {
      return JSON.parse(fs.readFileSync(submissionsFilePath, 'utf8'))
    }
  } catch {}
  return []
}

function writeLocalSubmissions(list: any[]) {
  try {
    const dir = path.dirname(submissionsFilePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(submissionsFilePath, JSON.stringify(list, null, 2), 'utf8')
  } catch {
    try {
      fs.writeFileSync(tmpSubmissionsFilePath, JSON.stringify(list, null, 2), 'utf8')
    } catch {}
  }
}

function saveSubmissionLocally(submission: any) {
  const list = readLocalSubmissions()
  list.unshift(submission)
  writeLocalSubmissions(list)
}

export async function GET() {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders })
      }
    } catch (err) {
      console.warn('Supabase contact fetch error:', err)
    }
  }

  const list = readLocalSubmissions()
  return NextResponse.json({ success: true, data: list }, { headers: noCacheHeaders })
}

export async function POST(req: NextRequest) {
  // Get IP for rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: noCacheHeaders }
    )
  }

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400, headers: noCacheHeaders })
  }

  const { name, email, subject, message, website } = body

  // Honeypot check
  if (website && website.trim() !== '') {
    return NextResponse.json({ success: true }, { headers: noCacheHeaders })
  }

  // Validate required fields
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 422, headers: noCacheHeaders })
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 422, headers: noCacheHeaders })
  }
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Subject is required.' }, { status: 422, headers: noCacheHeaders })
  }
  if (!message?.trim() || message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 422, headers: noCacheHeaders })
  }

  const newSubmission: any = {
    id: `sub_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    ip_address: ip,
    created_at: new Date().toISOString(),
    is_read: false,
  }

  // Try Supabase first to get UUID if generated
  try {
    const supabase = getServiceSupabase()
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from('contact_submissions')
        .insert({
          name: newSubmission.name,
          email: newSubmission.email,
          subject: newSubmission.subject,
          message: newSubmission.message,
          ip_address: ip,
          is_read: false,
        })
        .select()
        .single()

      if (!error && inserted?.id) {
        newSubmission.id = inserted.id
      }
    }
  } catch (err) {
    console.warn('Supabase sync skipped/failed:', err)
  }

  // Save locally
  saveSubmissionLocally(newSubmission)

  // Dispatch Telegram alert asynchronously without blocking client
  sendContactTelegramAlert({
    name: newSubmission.name,
    email: newSubmission.email,
    subject: newSubmission.subject,
    message: newSubmission.message,
    ip: newSubmission.ip_address,
  }).catch((err) => console.warn('Telegram contact notification failed:', err))

  return NextResponse.json({
    success: true,
    message: 'Your message has been received! I will get back to you soon.',
    data: newSubmission,
  }, { headers: noCacheHeaders })
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, is_read } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing submission id' }, { status: 400, headers: noCacheHeaders })

    // Update in Supabase
    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase
          .from('contact_submissions')
          .update({ is_read: !!is_read })
          .eq('id', id)
      } catch (err) {
        console.warn('Supabase mark read error:', err)
      }
    }

    // Update in local store
    const list = readLocalSubmissions()
    const updated = list.map((item: any) => (item.id === id ? { ...item, is_read: !!is_read } : item))
    writeLocalSubmissions(updated)

    return NextResponse.json({ success: true }, { headers: noCacheHeaders })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500, headers: noCacheHeaders })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing submission id' }, { status: 400, headers: noCacheHeaders })

    // Delete in Supabase
    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase.from('contact_submissions').delete().eq('id', id)
      } catch (err) {
        console.warn('Supabase delete submission error:', err)
      }
    }

    // Delete in local store
    const list = readLocalSubmissions()
    const updated = list.filter((item: any) => item.id !== id)
    writeLocalSubmissions(updated)

    return NextResponse.json({ success: true }, { headers: noCacheHeaders })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500, headers: noCacheHeaders })
  }
}
