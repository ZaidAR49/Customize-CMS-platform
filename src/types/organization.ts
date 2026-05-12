export interface OrgStats {
  families: number
  children: number
  women: number
  activities: number
}

export interface Organization {
  nameAr: string
  taglineAr: string
  foundedYear: number
  aboutAr: string
  missionAr: string
  visionAr: string
  phone: string
  email: string
  addressAr: string
  facebook: string
  twitter: string
  youtube: string
  instagram?: string
  stats: OrgStats
}

/** Keys stored in `organization.social` JSONB (see schema.sql) */
export const SOCIAL_PLATFORM_KEYS = [
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'tiktok',
  'whatsapp',
] as const

export type SocialPlatformKey = (typeof SOCIAL_PLATFORM_KEYS)[number]

export type OrganizationSocial = Partial<Record<SocialPlatformKey, string>>

/** Row shape returned from Supabase `organization` table */
export interface OrganizationRow {
  id: string
  name_ar: string
  name_en: string | null
  tagline_ar: string | null
  tagline_en: string | null
  about_ar: string | null
  about_en: string | null
  mission_ar: string | null
  mission_en: string | null
  vision_ar: string | null
  vision_en: string | null
  phone: string | null
  email: string | null
  founded_year: number | null
  social: OrganizationSocial | Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  updated_at?: string
  updated_by?: string | null
}

export interface OrganizationStatRow {
  id: string
  organization_id: string
  key: string
  label_ar: string
  label_en: string | null
  value: string
  icon: string | null
  display_order: number
  description_ar: string | null
  description_en: string | null
  updated_at?: string
  updated_by?: string | null
}
