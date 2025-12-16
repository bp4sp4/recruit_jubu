'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConsultationApplication } from '@/lib/types/database'

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [formData, setFormData] = useState<Omit<ConsultationApplication, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    contact: '',
    checkbox_selection: [],
    region: '서울',
    privacy_consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // 모달 닫을 때 폼 초기화
      setFormData({
        name: '',
        contact: '',
        checkbox_selection: [],
        region: '서울',
        privacy_consent: false,
      })
      setError('')
      setSuccess(false)
      setShowPrivacyDetail(false)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])


  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '')
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData({ ...formData, contact: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 필수 필드 검증
      if (!formData.name.trim()) {
        throw new Error('이름을 입력해주세요.')
      }
      if (!formData.contact.trim()) {
        throw new Error('연락처를 입력해주세요.')
      }
      if (!formData.privacy_consent) {
        throw new Error('개인정보 수집 및 이용 동의는 필수입니다.')
      }

      const { error: insertError } = await supabase
        .from('consultation_applications')
        .insert([formData])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || '신청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const regionOptions: ('서울' | '경기인천' | '그 외지역')[] = ['서울', '경기인천', '그 외지역']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-gray-300 rounded-2xl w-[720px] max-w-[90vw] max-h-[90vh] overflow-y-auto mx-4 shadow-2xl">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">파트너스 상담 신청하기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              신청이 완료되었습니다!
            </div>
          )}

          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              id="contact"
              type="tel"
              value={formData.contact}
              onChange={handlePhoneChange}
              required
              maxLength={13}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="010-1234-5678"
            />
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              지역 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {regionOptions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setFormData({ ...formData, region })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                    formData.region === region
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* 개인정보 수집 및 이용 동의 */}
          <div>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacy_consent}
                onChange={(e) =>
                  setFormData({ ...formData, privacy_consent: e.target.checked })
                }
                required
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-700">
                  개인정보 수집 및 이용 동의 <span className="text-red-500">*</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrivacyDetail(true)}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  자세히 보기
                </button>
              </div>
            </label>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '신청 중...' : success ? '신청 완료!' : '신청 완료'}
          </button>
        </form>
      </div>

      {/* 개인정보 수집 및 이용 동의 상세 팝업 */}
      {showPrivacyDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#00000080] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto mx-4 shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">개인정보 수집 및 이용 동의</h3>
              <button
                onClick={() => setShowPrivacyDetail(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">수집 항목</h4>
                <p>이름, 연락처, 학력, 분야</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">이용 목적</h4>
                <p>상담 신청 접수 및 관리, 서비스 제공</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">보유 및 이용 기간</h4>
                <p>
                  신청일로부터 1년 또는 관련 법령(전자상거래 등에서의 소비자 보호에 관한 법률 등)에 따라 보관될 수 있으며, 보유 기간 경과 시 즉시 파기합니다.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-red-600 font-medium">
                  동의 거부 시 상담 신청이 제한될 수 있습니다.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setShowPrivacyDetail(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

