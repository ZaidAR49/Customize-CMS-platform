export interface CategoryRow {
  id: string
  key: string
  display_order: number
  label_ar: string
  label_en: string | null
  description_ar: string | null
  description_en: string | null
  created_at?: string
}
