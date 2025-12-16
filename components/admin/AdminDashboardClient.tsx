'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ConsultationApplication } from '@/lib/types/database'

export default function AdminDashboardClient() {
  const [applications, setApplications] = useState<ConsultationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadApplications()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/admin/login')
    }
  }

  const loadApplications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('consultation_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setApplications(data || [])
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}"님의 신청 내역을 삭제하시겠습니까?`)) {
      return
    }

    try {
      setError('')
      const { error } = await supabase
        .from('consultation_applications')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete error:', error)
        throw error
      }

      // 목록 새로고침
      await loadApplications()
    } catch (err: any) {
      console.error('Delete failed:', err)
      setError(err.message || '삭제에 실패했습니다. Supabase RLS 정책을 확인해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">상담 신청 관리</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-blue-200">로딩 중...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-black/40 rounded-lg border border-blue-500/30">
            <p className="text-blue-200 text-lg">신청 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">이름</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">연락처</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">지역</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">개인정보수집 동의</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">신청일시</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/20">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-500/10 transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-medium">{app.name}</td>
                      <td className="px-6 py-4 text-sm text-white">{app.contact}</td>
                      <td className="px-6 py-4 text-sm text-white">{app.region}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded ${
                            app.privacy_consent
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {app.privacy_consent ? '동의' : '비동의'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-200">
                        {app.created_at ? formatDate(app.created_at) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(app.id!, app.name)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-blue-600/20 border-t border-blue-500/30">
              <p className="text-sm text-blue-200">
                총 {applications.length}건의 신청이 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

