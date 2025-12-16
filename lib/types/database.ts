export interface ConsultationApplication {
  id?: string
  name: string
  contact: string
  checkbox_selection: string[]
  region: '서울' | '경기인천' | '그 외지역'
  privacy_consent: boolean
  created_at?: string
  updated_at?: string
}

