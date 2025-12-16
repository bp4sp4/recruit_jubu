import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/admin'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 어드민 이메일 체크 (선택사항)
  if (!isAdminEmail(user.email)) {
    redirect('/admin/login?error=unauthorized')
  }

  return <AdminDashboardClient />
}

