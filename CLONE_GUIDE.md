# 프로젝트 복제 가이드

이 프로젝트를 복제하여 새로운 프로젝트를 만들 때 변경해야 할 항목들입니다.

## 1. 프로젝트 복제

### 방법 1: 스크립트 사용 (권장)
```bash
chmod +x clone-project.sh
./clone-project.sh 새_프로젝트_이름 ~/Documents/새_경로
```

예시:
```bash
./clone-project.sh recruit_new_project ~/Documents/GitHub
```

### 방법 2: 수동 복제
```bash
# 새 디렉토리 생성
mkdir ~/Documents/new_project
cd ~/Documents/new_project

# 현재 프로젝트 복제 (node_modules 제외)
rsync -av \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env*' \
  ~/Documents/GitHub/korhrd_recruit_eduvisors/ ./

# package.json name 변경
sed -i '' "s/korhrd_recruit_eduvisors/new_project_name/" package.json

# Git 초기화
git init
git add .
git commit -m "Initial commit"
```

## 2. 필수 변경 사항

### 2.1 package.json
- `name` 필드 변경

### 2.2 환경 변수 (.env 파일 생성)
```env
NEXT_PUBLIC_SUPABASE_URL=새로운_Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=새로운_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=새로운_SERVICE_ROLE_KEY
ADMIN_EMAILS=admin@example.com (선택사항)
```

### 2.3 데이터베이스 스키마 변경

#### lib/types/database.ts
- 테이블 구조에 맞게 타입 정의 수정
- 필드명이나 타입 변경 시 수정 필요

#### Supabase 마이그레이션
새 Supabase 프로젝트에서 다음 SQL 실행:

```sql
-- Drop existing table if exists
DROP TABLE IF EXISTS consultation_applications CASCADE;

-- Create consultation_applications table
CREATE TABLE consultation_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  checkbox_selection TEXT[],
  region TEXT NOT NULL CHECK (region IN ('서울', '경기인천', '그 외지역')),
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_consultation_applications_created_at 
  ON consultation_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE consultation_applications ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins) to read all applications
CREATE POLICY "Authenticated users can read all applications"
  ON consultation_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy for inserting applications (public access)
CREATE POLICY "Anyone can insert applications"
  ON consultation_applications
  FOR INSERT
  WITH CHECK (true);

-- Create policy for deleting applications (admins)
CREATE POLICY "Authenticated users can delete applications"
  ON consultation_applications
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

### 2.4 텍스트 내용 변경

#### app/page.tsx
- 헤더 로고 및 회사명
- 메인 콘텐츠 텍스트
- 버튼 텍스트 ("파트너스 신청하기")

#### components/Footer.tsx
다음 항목들을 새 회사 정보로 변경:
- 회사명: `(주)한평생교육그룹`
- 주소: `서울시 도봉구 창동 마들로13길 61 씨드큐브 905호`
- 사업자등록번호: `227-88-03196`
- 직업평생교육시설신고: `(제 원격20-6호)`
- 대표명: `양병웅`

#### components/ConsultationModal.tsx
- 모달 제목: "파트너스 상담 신청하기"
- 개인정보 수집 항목: 이름, 연락처, 학력, 분야
- 이용 목적: 상담 신청 접수 및 관리, 서비스 제공
- 보유 및 이용 기간 설명

#### app/admin/login/page.tsx
- 로그인 페이지 텍스트 ("어드민 로그인", "관리자 계정으로 로그인하세요")

#### components/admin/AdminDashboardClient.tsx
- 대시보드 제목: "상담 신청 관리"
- 테이블 컬럼명 (필요시)

### 2.5 이미지 파일 교체
- `public/logo2.png` - 새 로고로 교체
- `public/강남지점 채용공고 (1).png` - 새 채용공고 이미지로 교체

### 2.6 Supabase 설정
1. 새 Supabase 프로젝트 생성
2. 데이터베이스 마이그레이션 실행 (위 SQL 참고)
3. RLS 정책 확인
4. 어드민 계정 생성 (Authentication > Users > Add user)

## 3. 설치 및 실행

```bash
cd 새_프로젝트_경로
npm install
npm run dev
```

## 4. 체크리스트

- [ ] package.json name 변경
- [ ] .env 파일 생성 및 Supabase 설정
- [ ] 데이터베이스 스키마 수정 및 마이그레이션 실행
- [ ] 헤더 로고 및 회사명 변경
- [ ] 푸터 정보 변경
- [ ] 모달 텍스트 변경
- [ ] 이미지 파일 교체
- [ ] Supabase 어드민 계정 생성
- [ ] 테스트 (로그인, 신청, 삭제)

## 5. 주요 파일 위치

- **메인 페이지**: `app/page.tsx`
- **푸터**: `components/Footer.tsx`
- **상담 신청 모달**: `components/ConsultationModal.tsx`
- **어드민 로그인**: `app/admin/login/page.tsx`
- **어드민 대시보드**: `components/admin/AdminDashboardClient.tsx`
- **데이터베이스 타입**: `lib/types/database.ts`
- **Supabase 설정**: `lib/supabase/`

## 6. 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- 새 Supabase 프로젝트의 URL과 키를 반드시 변경하세요
- 데이터베이스 마이그레이션을 실행하기 전에 기존 테이블이 있는지 확인하세요
- 어드민 계정은 Supabase 대시보드에서 생성하세요

