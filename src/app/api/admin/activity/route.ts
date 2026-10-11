import { NextResponse } from 'next/server'
import { readActivityLogs } from '@/lib/builder-store'

export async function GET() {
  try {
    const logs = readActivityLogs()
    return NextResponse.json({ success: true, data: logs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
