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
