import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('user_session_id')
  cookieStore.delete('user_session_username')
  cookieStore.delete('user_session_email')
  cookieStore.delete('demo_user')
  cookieStore.delete('demo_username')
  cookieStore.delete('demo_admin')
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')

  return NextResponse.json({ success: true })
}
