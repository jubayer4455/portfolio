import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getUserSecretMessages,
  sendUserSecretMessage,
  markUserSecretMessageRead,
  deleteUserSecretMessage,
  getUserBioByUsername,
} from '@/lib/builder-store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cookieStore = await cookies()
    const sessionUser = cookieStore.get('user_session_username')?.value || cookieStore.get('demo_username')?.value || 'sarah'
    const targetUser = searchParams.get('username') || sessionUser

    if (!targetUser) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    const messages = getUserSecretMessages(targetUser)
    return NextResponse.json({ success: true, data: messages, count: messages.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, message, emoji } = body

    if (!username || !message || !message.trim()) {
      return NextResponse.json({ error: 'Message and recipient username required.' }, { status: 400 })
    }

    const cleanUser = decodeURIComponent(username).replace(/^@+/, '').trim().toLowerCase()
    const bio = await getUserBioByUsername(cleanUser)

    if (!bio) {
      return NextResponse.json({ error: 'User does not exist.' }, { status: 404 })
    }

    const saved = sendUserSecretMessage(cleanUser, message, emoji)
    return NextResponse.json({ success: true, data: saved })
  } catch (err: any) {
    console.error('Error in POST /api/user/messages:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    const ok = markUserSecretMessageRead(id)
    return NextResponse.json({ success: ok })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    const ok = deleteUserSecretMessage(id)
    return NextResponse.json({ success: ok })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
