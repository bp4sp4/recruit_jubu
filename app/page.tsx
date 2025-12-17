'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ConsultationModal from '@/components/ConsultationModal'
import Footer from '@/components/Footer'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [buttonColor, setButtonColor] = useState<'black' | 'blue'>('black')
  const [showSectionButton, setShowSectionButton] = useState(false)
  const [showFixedButton, setShowFixedButton] = useState(false)
  const footerRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!footerRef.current || !mainRef.current || !titleRef.current) return

      const footerTop = footerRef.current.offsetTop
      const scrollPosition = window.scrollY + window.innerHeight
      const titleTop = titleRef.current.offsetTop
      const titleBottom = titleRef.current.offsetTop + titleRef.current.offsetHeight
      const viewportTop = window.scrollY
      const viewportBottom = window.scrollY + window.innerHeight

      // 타이틀 섹션이 뷰포트 내에 있는지 확인
      const isTitleInViewport = viewportTop < titleBottom && viewportBottom > titleTop

      // 섹션 내에 있으면 섹션 버튼 표시, 벗어나면 고정 버튼 표시 (항상 표시)
      setShowSectionButton(isTitleInViewport)
      setShowFixedButton(!isTitleInViewport)

      // 메인 영역의 중간 지점을 기준으로 색상 변경
      const mainMiddle = mainRef.current.offsetTop + mainRef.current.offsetHeight / 2
      if (window.scrollY < mainMiddle) {
        setButtonColor('black')
      } else {
        setButtonColor('blue')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 초기 상태 설정

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center" style={{ maxWidth: '1000px' }}>
          <div className="flex items-center">
            <Image
              src="/logo2.png"
              alt="Eduvisors Logo"
              width={200}
              height={30}
              className="h-auto w-auto max-h-8"
              priority
            />
          </div>
          {/* <nav className="hidden md:flex gap-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">채용공고</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">지원하기</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">문의하기</a>
          </nav> */}
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main ref={mainRef} className="min-[1000px]:flex min-[1000px]:flex-col min-[1200px]:items-center min-[1200px]:justify-center">
        <div className="text-center space-y-8 max-w-4xl w-full">
          {/* 채용공고 이미지 */}
          <div className="mb-12 w-full flex justify-center">
            <Image
              src="/강남지점 채용공고 (1).png"
              alt="강남지점 채용공고"
              width={1000}
              height={800}
              className="w-full max-w-6xl h-auto rounded-lg shadow-lg"
              priority
            />
          </div>

          {/* 3D 큐브 그래픽 영역 (이미지로 대체 예정) */}
          <div className="mt-12 mb-12">
         
      

          {/* 신청 섹션 */}
          <section ref={titleRef} className="applySection flex flex-col justify-center items-center" style={{ height: '100vh' }}>
            <div className="titleBox text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                월 평균 150만원 수익
              </h1>
              
              {/* 서브 타이틀 */}
              <p className="tit text-3xl md:text-4xl font-bold text-red-600 mb-8">
                이제 여러분의 차례입니다
              </p>

              {/* 디스클레이머 */}
              <div className="desc text-sm text-gray-500 space-y-1 mt-12 mb-8">
                <p>*24년8월~25년7월 수익자 기준</p>
                <p>*수익은 보험 체결 후 발생하며 개인 차가 있을 수 있음</p>
              </div>
            </div>

            {/* 섹션 내 버튼 */}
            {showSectionButton && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn text-white text-center font-bold shadow-lg hover:shadow-xl"
                style={{
                  width: '780px',
                  height: '150px',
                  marginTop: '46px',
                  borderRadius: '20px',
                  backgroundColor: '#000',
                  fontSize: '48px',
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 700,
                  lineHeight: 'normal',
                  animation: 'blinkBg 0.8s infinite',
                }}
              >
                신청하기 →
              </button>
            )}
          </section>
        </div>
        </div>
      </main>

      {/* 푸터 */}
      <Footer ref={footerRef} />

      {/* 고정 버튼 - 섹션을 벗어나면 따라다님 */}
      {showFixedButton && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 text-white text-center font-bold shadow-lg hover:shadow-xl"
          style={{
            width: '780px',
            height: '150px',
            marginTop: '46px',
            borderRadius: '20px',
            backgroundColor: '#000',
            fontSize: '48px',
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 700,
            lineHeight: 'normal',
            animation: 'blinkBg 0.8s infinite',
          }}
        >
          신청하기 →
        </button>
      )}

      {/* 상담 신청 모달 */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
