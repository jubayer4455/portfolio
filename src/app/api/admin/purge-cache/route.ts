import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    revalidatePath('/')
    revalidatePath('/gallery')
    revalidatePath('/about')
    revalidatePath('/contact')
    revalidatePath('/projects')
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
    revalidatePath('/admin/social')
    revalidatePath('/admin/gallery')
    revalidatePath('/admin/projects')
    revalidatePath('/admin/users')
    revalidatePath('/admin/messages')
    revalidatePath('/admin/reviews')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'All live pages and admin caches purged and synchronized successfully!',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cache purge failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
