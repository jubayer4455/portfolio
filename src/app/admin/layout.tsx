import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch {
    //
  }

  const cookieStore = cookies()
  const isDemo = cookieStore.get('demo_admin')?.value === 'true'
  if (isDemo && !user) {
    user = { email: 'admin@portfolio.com' } as any
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col md:flex-row">
      <AdminSidebar userEmail={user.email || 'admin@portfolio.com'} />
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 min-w-0">
        {children}
      </main>
    </div>
  )
}
