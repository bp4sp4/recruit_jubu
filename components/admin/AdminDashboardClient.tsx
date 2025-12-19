'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ConsultationApplication } from '@/lib/types/database'

export default function AdminDashboardClient() {
  const [applications, setApplications] = useState<ConsultationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
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

  const handleDeliveryToggle = async (id: string, isDelivered: boolean) => {
    try {
      setError('')
      const updateData: { delivered_at: string | null } = {
        delivered_at: isDelivered ? new Date().toISOString() : null,
      }

      const { data, error } = await supabase
        .from('consultation_applications')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) {
        console.error('Delivery error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        setToastMessage('전달 처리 실패')
        setTimeout(() => {
          setToastMessage('')
        }, 2000)
        throw error
      }

      console.log('Delivery update successful:', data)

      // 목록 새로고침
      await loadApplications()
      
      // 성공 토스트 메시지
      setToastMessage(isDelivered ? '전달처리되었습니다' : '전달처리 취소되었습니다')
      setTimeout(() => {
        setToastMessage('')
      }, 2000)
    } catch (err: any) {
      console.error('Delivery failed:', err)
      const errorMessage = err.message || '전달 처리에 실패했습니다.'
      setError(errorMessage)
      setToastMessage('전달 처리 실패')
      setTimeout(() => {
        setToastMessage('')
      }, 2000)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage('복사 완료')
      setTimeout(() => {
        setToastMessage('')
      }, 2000)
    }).catch(() => {
      setToastMessage('복사 실패')
      setTimeout(() => {
        setToastMessage('')
      }, 2000)
    })
  }

  const copyApplicationInfo = (app: ConsultationApplication) => {
    const info = `이름: ${app.name}
연락처: ${app.contact}
지역: ${app.region}
유입 경로: ${app.source || '직접 접근'}
신청일시: ${app.created_at ? formatDate(app.created_at) : '-'}
${app.checkbox_selection && app.checkbox_selection.length > 0 ? `선택 항목: ${app.checkbox_selection.join(', ')}\n` : ''}`
    copyToClipboard(info, '지원자 정보')
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

        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 transition-opacity duration-300">
            <div className="bg-gray-50 text-gray-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{toastMessage}</span>
            </div>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">전달 상태</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">이름</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">연락처</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">지역</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">유입 경로</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">개인정보수집 동의</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">신청일시</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/20">
                  {applications.map((app) => {
                    // 유입 경로 표시 로직
                    const getSourceDisplay = () => {
                      if (app.source) {
                        return app.source
                      }
                      if (app.utm_source) {
                        return app.utm_source
                      }
                      if (app.referrer_url && app.referrer_url !== 'direct') {
                        try {
                          const url = new URL(app.referrer_url)
                          return url.hostname.replace('www.', '')
                        } catch {
                          return app.referrer_url
                        }
                      }
                      return '직접 접근'
                    }

                    const sourceDisplay = getSourceDisplay()
                    const getSourceBadgeColor = (source: string) => {
                      if (source.includes('네이버')) return 'bg-blue-500/20 text-blue-300'
                      if (source.includes('당근')) return 'bg-orange-500/20 text-orange-300'
                      if (source.includes('인스타')) return 'bg-pink-500/20 text-pink-300'
                      if (source === '직접 접근') return 'bg-gray-500/20 text-gray-300'
                      return 'bg-purple-500/20 text-purple-300'
                    }

                    const isDelivered = !!app.delivered_at

                    return (
                      <tr 
                        key={app.id} 
                        className={`transition-colors ${
                          isDelivered 
                            ? 'bg-green-500/20 hover:bg-green-500/25' 
                            : 'hover:bg-blue-500/10'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isDelivered}
                              onChange={(e) => handleDeliveryToggle(app.id!, e.target.checked)}
                              className="w-5 h-5 rounded border-2 border-blue-400 bg-transparent checked:bg-green-500 checked:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                            />
                            <span className="text-white text-sm">
                              {isDelivered ? '전달완료' : '전달대기'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">{app.name}</td>
                        <td className="px-6 py-4 text-sm text-white">{app.contact}</td>
                        <td className="px-6 py-4 text-sm text-white">{app.region}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadgeColor(sourceDisplay)}`}
                          >
                            {sourceDisplay}
                          </span>
                        </td>
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
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => copyApplicationInfo(app)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                              title="지원자 정보 복사"
                            >
                              복사
                            </button>
                            <button
                              onClick={() => handleDelete(app.id!, app.name)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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

