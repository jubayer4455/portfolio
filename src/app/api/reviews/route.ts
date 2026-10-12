import { NextRequest, NextResponse } from 'next/server'
import { getApprovedReviews, addReview } from '@/lib/builder-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const reviews = await getApprovedReviews()
    return NextResponse.json({ success: true, data: reviews }, { headers: noCacheHeaders })
  } catch (err: any) {
    console.error('Error fetching reviews:', err)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500, headers: noCacheHeaders })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_name, user_photo, social_link, rating, comment } = body

    if (!user_name || !user_name.trim()) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 })
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: 'Please enter your review comment.' }, { status: 400 })
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5))

    const newReview = await addReview({
      user_name: user_name.trim(),
      user_photo: user_photo?.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user_name)}`,
      social_link: social_link?.trim() || '',
      rating: numericRating,
      comment: comment.trim(),
    })

    return NextResponse.json({
      success: true,
      data: newReview,
      message: 'Review submitted successfully! It will appear on the site once approved by Abdul.',
    })
  } catch (err: any) {
    console.error('Error submitting review:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
