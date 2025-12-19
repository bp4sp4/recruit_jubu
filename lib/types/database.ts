export interface ConsultationApplication {
  id?: string
  name: string
  contact: string
  checkbox_selection: string[]
  region: '서울' | '경기인천' | '그 외지역'
  privacy_consent: boolean
  referrer_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  source?: string
  delivered_to?: string
  delivered_at?: string
  created_at?: string
  updated_at?: string
}

