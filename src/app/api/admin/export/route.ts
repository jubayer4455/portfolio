import { NextResponse } from 'next/server'
import { readAllUserBios, readAllReviews } from '@/lib/builder-store'
import { readAnonymousMessages } from '@/lib/content-store'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const users = readAllUserBios()
    const reviews = readAllReviews()
    const secretMessages = readAnonymousMessages()

    let contactSubmissions: any[] = []
    const submissionsPath = path.join(process.cwd(), 'src', 'data', 'contact-submissions.json')
    try {
      if (fs.existsSync(submissionsPath)) {
        contactSubmissions = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'))
      }
    } catch {}

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        reviews: reviews.length,
        secretMessages: secretMessages.length,
        contactSubmissions: contactSubmissions.length,
      },
      data: {
        users,
        reviews,
        secretMessages,
        contactSubmissions,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
