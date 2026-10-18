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
  const sessionEmail = cookieStore.get('user_session_email')?.value
  if ((isDemo || sessionEmail === 'jubayerahmmed2k@gmail.com') && !user) {
    user = { email: 'jubayerahmmed2k@gmail.com' } as any
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col md:flex-row relative selection:bg-orange-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[300px] bg-orange-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[300px] bg-purple-500/5 blur-[120px] pointer-events-none -z-10" />
      <AdminSidebar userEmail={user.email || 'jubayerahmmed2k@gmail.com'} />
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 min-w-0">
        {children}
      </main>
    </div>
  )
}
