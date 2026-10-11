import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { recordActivity } from '@/lib/builder-store'

const broadcastPath = path.join(process.cwd(), 'src', 'data', 'site-broadcast.json')

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

function readBroadcast(): BroadcastData {
  try {
    if (fs.existsSync(broadcastPath)) {
      return JSON.parse(fs.readFileSync(broadcastPath, 'utf8'))
    }
  } catch {}
  return {
    enabled: false,
    message: '',
    badge_text: 'NOTICE',
    badge_color: 'orange',
    link_url: '',
    link_label: '',
    dismissible: true,
    updated_at: new Date().toISOString(),
  }
}

export async function GET() {
  const data = readBroadcast()
  return NextResponse.json({ success: true, data })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const current = readBroadcast()

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

    const dir = path.dirname(broadcastPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(broadcastPath, JSON.stringify(updated, null, 2), 'utf8')

    recordActivity(
      'broadcast_updated',
      'Global Announcement Updated',
      updated.enabled
        ? `Broadcast published: "${updated.message.slice(0, 40)}..."`
        : 'Global broadcast announcement deactivated',
      'system',
      'Abdul Al Jubayer'
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
