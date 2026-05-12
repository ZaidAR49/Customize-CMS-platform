export interface OrgStats {
  families:   number
  children:   number
  women:      number
  activities: number
}

export interface Organization {
  nameAr:       string
  taglineAr:    string
  foundedYear:  number
  aboutAr:      string
  missionAr:    string
  visionAr:     string
  phone:        string
  email:        string
  addressAr:    string
  facebook:     string
  twitter:      string
  youtube:      string
  instagram?:   string
  stats:        OrgStats
}

/** Row shape returned from Supabase `organization` table */
export interface OrganizationRow {
  id: string
  name_ar: string
  name_en: string | null
  tagline_ar: string | null
  founded_year: number | null
  logo_url: string | null
  about_ar: string | null
  mission_ar: string | null
  vision_ar: string | null
  phone: string | null
  email: string | null
  address_ar: string | null
  google_maps_url: string | null
  facebook_url: string | null
  twitter_url: string | null
  youtube_url: string | null
  stat_families: number | null
  stat_children: number | null
  stat_women: number | null
  stat_activities: number | null
  updated_at?: string
  updated_by?: string | null
}
