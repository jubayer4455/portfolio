import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminPassword, updateAdminPassword } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const isDemoAdmin = cookieStore.get('demo_admin')?.value === 'true'
    const sessionUser = cookieStore.get('user_session_username')?.value
    const sessionEmail = cookieStore.get('user_session_email')?.value

    const isAuthenticated =
      isDemoAdmin ||
      sessionUser === 'jubayer' ||
      sessionEmail === 'jubayerahmmed2k@gmail.com'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as Administrator first.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { currentPassword, newPassword, confirmPassword } = body

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Please enter your current admin password.' },
        { status: 400 }
      )
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match.' },
        { status: 400 }
      )
    }

    // Verify current password
    const isCurrentValid = await verifyAdminPassword(currentPassword)
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect. Please enter your valid admin password.' },
        { status: 400 }
      )
    }

    // Update password
    const result = await updateAdminPassword(newPassword)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update password.' },
        { status: 500 }
      )
    }

    // Refresh session cookie
    cookieStore.set('demo_admin', 'true', { path: '/', maxAge: 60 * 60 * 24 * 7 })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! You can now use your new password across all devices.',
    })
  } catch (err: any) {
    console.error('Password change error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error while changing password.' },
      { status: 500 }
    )
  }
}
