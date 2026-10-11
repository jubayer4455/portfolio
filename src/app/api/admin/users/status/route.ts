import { NextResponse } from 'next/server'
import { updateUserBioStatus, recordActivity } from '@/lib/builder-store'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, username, is_verified, is_suspended, is_featured } = body

    if (!id && !username) {
      return NextResponse.json({ error: 'Missing user id or username' }, { status: 400 })
    }

    const updated = await updateUserBioStatus(id || username, {
      is_verified,
      is_suspended,
      is_featured,
    })

    if (!updated) {
      return NextResponse.json({ error: 'User bio not found' }, { status: 404 })
    }

    // Log the administrative action in audit activity log
    if (typeof is_verified === 'boolean') {
      recordActivity(
        is_verified ? 'user_verified' : 'user_unverified',
        is_verified ? 'Official Verified Badge Awarded' : 'Verified Badge Removed',
        `Admin updated verification status for @${updated.username} to ${is_verified ? 'Verified' : 'Unverified'}`,
        'security',
        updated.display_name
      )
    }

    if (typeof is_suspended === 'boolean') {
      recordActivity(
        is_suspended ? 'user_suspended' : 'user_unsuspended',
        is_suspended ? 'User Bio Suspended' : 'User Bio Reactivated',
        `Admin ${is_suspended ? 'suspended' : 'reactivated'} bio access for @${updated.username}`,
        'security',
        updated.display_name
      )
    }

    if (typeof is_featured === 'boolean') {
      recordActivity(
        is_featured ? 'user_featured' : 'user_unfeatured',
        is_featured ? 'Creator Featured on Homepage' : 'Creator Unfeatured from Homepage',
        `Admin set @${updated.username} featured status to ${is_featured}`,
        'user',
        updated.display_name
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
