import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { createClient } from '@supabase/supabase-js'
import { recordActivity } from '@/lib/builder-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
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

const broadcastPath = path.join(process.cwd(), 'src', 'data', 'site-broadcast.json')
const tmpBroadcastPath = path.join(os.tmpdir(), 'site-broadcast.json')

export interface BroadcastData {
  enabled: boolean
  message: string
  badge_text: string
  badge_color: 'orange' | 'emerald' | 'cyan' | 'purple' | 'pink'
  link_url?: string
  link_label?: string
  dismissible: boolean
  updated_at: string
}

const defaultBroadcast: BroadcastData = {
  enabled: false,
  message: '',
  badge_text: 'NOTICE',
  badge_color: 'orange',
  link_url: '',
  link_label: '',
  dismissible: true,
  updated_at: new Date().toISOString(),
}

async function readBroadcast(): Promise<BroadcastData> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'broadcast_announcement_json')
        .maybeSingle()
      if (!error && data && data.value) {
        const parsed = JSON.parse(data.value)
        if (parsed && typeof parsed === 'object') {
          return parsed as BroadcastData
        }
      }
    } catch {}
  }

  try {
    if (fs.existsSync(tmpBroadcastPath)) {
      return JSON.parse(fs.readFileSync(tmpBroadcastPath, 'utf8'))
    }
    if (fs.existsSync(broadcastPath)) {
      return JSON.parse(fs.readFileSync(broadcastPath, 'utf8'))
    }
  } catch {}

  return defaultBroadcast
}

async function writeBroadcast(data: BroadcastData): Promise<void> {
  try {
    const dir = path.dirname(broadcastPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(broadcastPath, JSON.stringify(data, null, 2), 'utf8')
  } catch {
    try {
      fs.writeFileSync(tmpBroadcastPath, JSON.stringify(data, null, 2), 'utf8')
    } catch {}
  }

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'broadcast_announcement_json',
        value: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to sync broadcast to Supabase:', err)
    }
  }
}

export async function GET() {
  const data = await readBroadcast()
  return NextResponse.json({ success: true, data }, { headers: noCacheHeaders })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const current = await readBroadcast()

    const updated: BroadcastData = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : current.enabled,
      message: body.message !== undefined ? body.message : current.message,
      badge_text: body.badge_text || current.badge_text || 'NOTICE',
      badge_color: body.badge_color || current.badge_color || 'orange',
      link_url: body.link_url !== undefined ? body.link_url : current.link_url,
      link_label: body.link_label !== undefined ? body.link_label : current.link_label,
      dismissible: typeof body.dismissible === 'boolean' ? body.dismissible : current.dismissible,
      updated_at: new Date().toISOString(),
    }

    await writeBroadcast(updated)

    recordActivity(
      'broadcast_updated',
      'Global Announcement Updated',
      updated.enabled
        ? `Broadcast published: "${updated.message.slice(0, 40)}..."`
        : 'Global broadcast announcement deactivated',
      'system',
      'Abdul Al Jubayer'
    )

    return NextResponse.json({ success: true, data: updated }, { headers: noCacheHeaders })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500, headers: noCacheHeaders })
  }
}
