'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConsultationApplication } from '@/lib/types/database'

export default function ConsultationForm() {
  const [formData, setFormData] = useState<Omit<ConsultationApplication, 'id' | 'created_at' | 'updated_at' | 'region'> & { region: '서울' | '경기인천' | '그 외지역' | '' }>({
    name: '',
    contact: '',
    checkbox_selection: [],
    region: '' as '',
    privacy_consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contactError, setContactError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false)
  const [referrerData, setReferrerData] = useState<{
    referrer_url?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    source?: string
  }>({})
  const supabase = createClient()

  // 리퍼러 정보 수집 및 소스 자동 분류
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const referrer = document.referrer || ''
      const utmSource = params.get('utm_source') || ''
      
      // 소스 자동 분류
      let source = 'direct'
      const referrerLower = referrer.toLowerCase()
      
      if (utmSource) {
        if (utmSource.includes('naver') || utmSource.includes('네이버')) {
          source = '네이버 파워링크'
        } else if (utmSource.includes('daangn') || utmSource.includes('당근')) {
          source = '당근'
        } else if (utmSource.includes('instagram') || utmSource.includes('인스타')) {
          source = '인스타'
        } else {
          source = utmSource
        }
      } else if (referrer) {
        if (referrerLower.includes('naver.com') || referrerLower.includes('search.naver')) {
          source = '네이버 검색'
        } else if (referrerLower.includes('daangn.com') || referrerLower.includes('당근')) {
          source = '당근'
        } else if (referrerLower.includes('instagram.com') || referrerLower.includes('instagr.am')) {
          source = '인스타'
        } else {
          source = '기타'
        }
      }
      
      setReferrerData({
        referrer_url: referrer || 'direct',
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
        source: source,
      })
    }
  }, [])

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^010-\d{4}-\d{4}$/
    return phoneRegex.test(phone)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData({ ...formData, contact: formatted })
    
    if (formatted.length > 0 && formatted.length === 13) {
      if (!validatePhoneNumber(formatted)) {
        setContactError('올바른 전화번호 형식이 아니에요')
      } else {
        setContactError('')
      }
    } else if (formatted.length === 0) {
      setContactError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) {
        throw new Error('이름을 입력해주세요.')
      }
      if (!formData.contact.trim()) {
        throw new Error('연락처를 입력해주세요.')
      }
      if (!validatePhoneNumber(formData.contact)) {
        throw new Error('올바른 전화번호 형식이 아니에요')
      }
      if (!formData.region) {
        throw new Error('지역을 선택해주세요.')
      }
      if (!formData.privacy_consent) {
        throw new Error('개인정보 수집 및 이용 동의는 필수입니다.')
      }

      const dataToInsert = { 
        ...formData, 
        region: formData.region as '서울' | '경기인천' | '그 외지역',
        ...referrerData
      }
      
      const { error: insertError } = await supabase
        .from('consultation_applications')
        .insert([dataToInsert])

      if (insertError) throw insertError

      // Slack 알림 전송 (실패해도 사용자에게는 성공으로 표시)
      try {
        const slackResponse = await fetch('/api/slack/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            contact: formData.contact,
            region: formData.region,
            source: referrerData.source,
            utm_source: referrerData.utm_source,
            referrer_url: referrerData.referrer_url,
          }),
        })
        
        if (!slackResponse.ok) {
          const errorData = await slackResponse.json().catch(() => ({}))
          console.error('Slack 알림 전송 실패:', {
            status: slackResponse.status,
            statusText: slackResponse.statusText,
            error: errorData,
          })
        } else {
          console.log('Slack 알림 전송 성공')
        }
      } catch (slackError) {
        // Slack 알림 실패는 로그만 남기고 사용자에게는 에러를 표시하지 않음
        console.error('Slack 알림 전송 중 오류:', slackError)
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || '신청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const regionOptions: ('서울' | '경기인천' | '그 외지역')[] = ['서울', '경기인천', '그 외지역']

  useEffect(() => {
    if (success) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [success])

  const handleCloseSuccess = () => {
    setSuccess(false)
    setFormData({
      name: '',
      contact: '',
      checkbox_selection: [],
      region: '',
      privacy_consent: false,
    })
  }

  return (
    <>
      {/* 성공 팝업 */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-[400px] max-w-[90vw] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/check.gif" 
                alt="완료" 
                className="w-18 h-auto object-cover"
              />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              지원이 완료되었습니다
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              담당자가 빠른시일내에 연락 드리겠습니다.
            </p>
            <button
              onClick={handleCloseSuccess}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-xs md:text-sm">
            {error}
          </div>
        )}

        {/* 이름 */}
        <div>
          <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-900 mb-3">
            이름 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200"
              style={{
                height: '48px',
                fontSize: '15px',
                color: '#333d4b',
                boxShadow: 'none',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = 'inset 0 0 0 2px #3182f6'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
                e.target.style.borderColor = '#e5e7eb'
              }}
              placeholder="이름을 입력하세요"
            />
          </div>
        </div>

        {/* 연락처 */}
        <div>
          <label htmlFor="contact" className="block text-xs md:text-sm font-medium text-gray-900 mb-3">
            연락처 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="contact"
              type="tel"
              value={formData.contact}
              onChange={handlePhoneChange}
              required
              maxLength={13}
              className={`w-full px-4 py-3 bg-white border rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                contactError ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{
                height: '48px',
                fontSize: '15px',
                color: '#333d4b',
                boxShadow: 'none',
              }}
              onFocus={(e) => {
                if (contactError) {
                  e.target.style.boxShadow = 'inset 0 0 0 2px #ef4444'
                  e.target.style.borderColor = '#ef4444'
                } else {
                  e.target.style.boxShadow = 'inset 0 0 0 2px #3182f6'
                }
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
                if (contactError) {
                  e.target.style.borderColor = '#ef4444'
                } else {
                  e.target.style.borderColor = '#e5e7eb'
                }
              }}
              placeholder="01012345678"
            />
          </div>
          {contactError && (
            <p className="mt-2 text-sm text-red-500">{contactError}</p>
          )}
        </div>

        {/* 지역 */}
        <div className='mb-2'>
          <label className="block text-xs md:text-sm font-medium text-gray-900 mb-2">
            지역 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {regionOptions.map((region) => (
              <label
                key={region}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.region === region}
                    onChange={() => setFormData({ ...formData, region: formData.region === region ? '' : region })}
                    className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-colors"
                  />
                  {formData.region === region && (
                    <svg
                      className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-900">{region}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 개인정보 수집 및 이용 동의 */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.privacy_consent}
                onChange={(e) => setFormData({ ...formData, privacy_consent: e.target.checked })}
                className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-colors"
              />
              {formData.privacy_consent && (
                <svg
                  className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-xs md:text-sm text-gray-900">
              개인정보 수집 및 이용 동의 <span className="text-red-500">*</span>{' '}
              <button
                type="button"
                onClick={() => setShowPrivacyDetail(!showPrivacyDetail)}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                자세히 보기
              </button>
            </span>
          </label>
          {showPrivacyDetail && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs md:text-sm text-gray-700">
              <p className="font-semibold mb-2">개인정보 수집 및 이용 동의</p>
              <p className="mb-2">수집 항목: 이름, 연락처, 지역</p>
              <p className="mb-2">이용 목적: 면접 지원 접수 및 관리</p>
              <p>보유 및 이용 기간: 지원 처리 완료 후 1년</p>
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.contact || !formData.region || !formData.privacy_consent || !!contactError}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
          >
            {loading ? '제출 중...' : '교육 신청하기'}
          </button>
        </div>
      </form>
      </div>
    </>
  )
}

