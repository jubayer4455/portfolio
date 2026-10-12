import { NextRequest, NextResponse } from 'next/server'
import {
  getAnonymousMessages,
  saveAnonymousMessages,
  addAnonymousMessage,
} from '@/lib/content-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const list = await getAnonymousMessages()
    return NextResponse.json({ data: list }, { headers: noCacheHeaders })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500, headers: noCacheHeaders })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, emoji } = body

    if (!message || message.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a message (at least 2 characters).' },
        { status: 400, headers: noCacheHeaders }
      )
    }

    const newMsg = await addAnonymousMessage(message, emoji || '💭')
    return NextResponse.json({ success: true, data: newMsg }, { headers: noCacheHeaders })
  } catch (err: any) {
    console.error('[messages/anonymous POST] error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500, headers: noCacheHeaders })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, is_read } = await req.json()
    const list = await getAnonymousMessages()
    const updated = list.map((m) => (m.id === id ? { ...m, is_read: !!is_read } : m))
    await saveAnonymousMessages(updated)
    return NextResponse.json({ success: true }, { headers: noCacheHeaders })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500, headers: noCacheHeaders })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: noCacheHeaders })

    const list = await getAnonymousMessages()
    const filtered = list.filter((m) => m.id !== id)
    await saveAnonymousMessages(filtered)
    return NextResponse.json({ success: true }, { headers: noCacheHeaders })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500, headers: noCacheHeaders })
  }
}
