import { forwardRef } from 'react'

const Footer = forwardRef<HTMLElement>((props, ref) => {
  return (
    <footer ref={ref} className="bg-gray-100 text-gray-700 py-12">
      <div className="container mx-auto px-4" style={{ maxWidth: '1000px' }}>
        <div className="text-left space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">(주)한평생교육그룹</h3>
            <p className="text-sm text-gray-600">
              서울시 도봉구 창동 마들로13길 61 씨드큐브 905호
            </p>
          </div>
          <div className="text-sm text-gray-600 flex flex-wrap gap-1">
            <p>사업자등록번호 : 227-88-03196 | </p>
            <p>직업평생교육시설신고 (제 원격20-6호) | </p>
            <p>대표: 양병웅</p>
          </div>
          <div className="pt-4 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              ©(주)한평생교육그룹 All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

export default Footer

