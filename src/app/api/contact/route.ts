import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

function saveSubmissionLocally(submission: any) {
  try {
    const dir = path.dirname(submissionsFilePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    let list: any[] = []
    if (fs.existsSync(submissionsFilePath)) {
      list = JSON.parse(fs.readFileSync(submissionsFilePath, 'utf8'))
    }
    list.unshift(submission)
    fs.writeFileSync(submissionsFilePath, JSON.stringify(list, null, 2), 'utf8')
  } catch (err) {
    console.warn('Could not save submission locally:', err)
  }
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
      { status: 429 }
    )
  }

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, email, subject, message, website } = body

  // Honeypot check
  if (website && website.trim() !== '') {
    // Silent success for bots
    return NextResponse.json({ success: true })
  }

  // Validate required fields
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 422 })
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 422 })
  }
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Subject is required.' }, { status: 422 })
  }
  if (!message?.trim() || message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 422 })
  }

  const newSubmission = {
    id: `sub_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    ip_address: ip,
    created_at: new Date().toISOString(),
    is_read: false,
  }

  // 1. Save locally
  saveSubmissionLocally(newSubmission)

  // 2. Try Supabase if configured
  try {
    const supabase = getServiceSupabase()
    if (supabase) {
      await supabase.from('contact_submissions').insert({
        name: newSubmission.name,
        email: newSubmission.email,
        subject: newSubmission.subject,
        message: newSubmission.message,
        ip_address: ip,
      })
    }
  } catch (err) {
    console.warn('Supabase sync skipped/failed:', err)
  }

  return NextResponse.json({
    success: true,
    message: 'Your message has been received! I will get back to you soon.',
  })
}
