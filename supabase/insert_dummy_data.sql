-- 더미 데이터 4개 삽입
INSERT INTO consultation_applications (
  name,
  contact,
  region,
  privacy_consent,
  source,
  utm_source,
  utm_medium,
  utm_campaign,
  referrer_url,
  checkbox_selection,
  created_at
) VALUES
  (
    '김철수',
    '010-1234-5678',
    '서울',
    true,
    '네이버 파워링크',
    'naver',
    'cpc',
    '주부부업',
    'https://search.naver.com/search.naver?query=주부부업',
    ARRAY['온라인', '재택'],
    NOW() - INTERVAL '2 days'
  ),
  (
    '이영희',
    '010-2345-6789',
    '경기인천',
    true,
    '당근마켓',
    'daangn',
    'organic',
    '주부부업',
    'https://www.daangn.com',
    ARRAY['온라인'],
    NOW() - INTERVAL '1 day'
  ),
  (
    '박민수',
    '010-3456-7890',
    '그 외지역',
    true,
    '인스타그램',
    'instagram',
    'social',
    '주부부업',
    'https://www.instagram.com',
    ARRAY['재택'],
    NOW() - INTERVAL '5 hours'
  ),
  (
    '최지영',
    '010-4567-8901',
    '서울',
    true,
    '직접 접근',
    NULL,
    NULL,
    NULL,
    'direct',
    ARRAY[]::TEXT[],
    NOW() - INTERVAL '1 hour'
  );

