'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ConsultationForm from '@/components/ConsultationForm'
import Footer from '@/components/Footer'

export default function Home() {
  const [buttonColor, setButtonColor] = useState<'black' | 'blue'>('black')
  const [showButton, setShowButton] = useState(true)
  const footerRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!footerRef.current || !mainRef.current || !formSectionRef.current) return

      const footerTop = footerRef.current.offsetTop
      const formTop = formSectionRef.current.offsetTop
      const viewportBottom = window.scrollY + window.innerHeight

      // 폼 섹션에 도달하면 버튼 숨기기
      const isFormVisible = viewportBottom >= formTop - 100
      
      // 푸터가 뷰포트에 들어오면 버튼 숨기기
      const isFooterVisible = viewportBottom >= footerTop - 100
      
      // 폼이나 푸터에 도달하면 버튼 숨기기
      setShowButton(!isFormVisible && !isFooterVisible)

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
        <div className="container mx-auto md:px-0 px-4 py-4 flex justify-between items-center" style={{ maxWidth: '1000px',  }}>
          <div className="flex items-center">
            <Image
              src="/logo2.png"  
              alt="logo"
              width={200}
              height={30}
              className="h-auto w-auto max-h-5 md:max-h-8"
              priority
              unoptimized
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
      <main ref={mainRef} className="flex flex-col items-center justify-center">
        <div className="text-center space-y-8 w-full bg-gray-100" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* 채용공고 이미지 */}
          <div className=" flex justify-center">
            <img
              src="/main_desktop.png"
              alt="강남지점 채용공고"
              className="max-w-full h-auto  object-cover"
              style={{ maxWidth: '1000px', width: '100%' }}
            />
          </div>

        </div>
      </main>

      {/* 폼 섹션 - 항상 표시 */}
      <section 
        ref={formSectionRef}
        className="w-full bg-white py-12 md:py-[120px]"
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-[120px] items-start">
            {/* 왼쪽: 메시지 영역 */}
            <div className=" text-center md:text-left">
              <p className="text-[17px] text-[#4e5968] md:text-[20px] font-medium">
              관련해서 자세한 내용은
              </p>
              <div className="h-[8px] md:h-[8px]"></div>
              <p className="text-[#333d4b] text-[24px] md:text-[34px] text-gray-600 font-bold">
              교육 신청서를 작성해 주세요.
              </p>
              <div className="h-[8px] md:h-[24px]"></div>
              <p className="text-[17px] text-[#4e5968] md:text-[20px] font-medium">
              <span className="text-[#2b7fff]">월요일</span>에 연락드릴게요.
              </p>
            </div>

            {/* 오른쪽: 폼 */}
            <div>
              <ConsultationForm />
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <Footer ref={footerRef} />

      {/* 고정 버튼 - 폼 섹션에 도달하기 전까지만 표시 (데스크톱) */}
      {showButton && (
        <button
          onClick={() => {
            formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 text-white text-center font-bold shadow-lg hover:shadow-xl transition-opacity duration-300"
          style={{
            width: '780px',
            height: '150px',
            borderRadius: '20px',
            backgroundColor: '#000',
            fontSize: '48px',
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 700,
            lineHeight: 'normal',
            opacity: showButton ? 1 : 0,
          }}
        >
          교육 신청하기 &gt;
        </button>
      )}

      {/* 고정 버튼 - 폼 섹션에 도달하기 전까지만 표시 (모바일) */}
      {showButton && (
        <button
          onClick={() => {
            formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="md:hidden fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 text-white text-center font-bold shadow-lg hover:shadow-xl transition-opacity duration-300"
          style={{
            width: '90%',
            maxWidth: '400px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: '#000',
            fontSize: '28px',
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 700,
            lineHeight: 'normal',
            opacity: showButton ? 1 : 0,
          }}
        >
          교육 신청하기 &gt;
        </button>
      )}
    </div>
  )
}
