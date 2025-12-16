// 어드민 이메일 목록
// 환경 변수에서 가져오거나 여기에 직접 설정할 수 있습니다
export const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim())
  : [
      // 기본 어드민 이메일을 여기에 추가하세요
      // 'admin@example.com',
    ]

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS.includes(email) : true
  // ADMIN_EMAILS가 비어있으면 모든 인증된 사용자 허용 (개발용)
  // 프로덕션에서는 반드시 ADMIN_EMAILS를 설정하세요
}

