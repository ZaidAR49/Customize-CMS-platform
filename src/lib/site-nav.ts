export type SiteNavItem = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export const dashboardNavItem: SiteNavItem = {
  label: 'لوحة التحكم',
  href: '/dashboard',
}
