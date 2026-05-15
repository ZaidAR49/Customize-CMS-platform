import { centers } from '@/data/centers'
import { programs } from '@/data/programs'

export type SiteNavItem = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export const siteNavItems: SiteNavItem[] = [
  { label: 'الرئيسية', href: '/' },
  {
    label: 'مراكز الجمعية',
    href: '#',
    children: centers.map((c) => ({ label: c.nameAr, href: `/centers/${c.slug}` })),
  },
  {
    label: 'البرامج والمشاريع',
    href: '#',
    children: programs.map((p) => ({ label: p.nameAr, href: `/programs/${p.slug}` })),
  },
  { label: 'نشاطات وأخبار', href: '/news' },
  { label: 'عن الجمعية', href: '/about' },
  { label: 'اتصل بنا', href: '/contact' },
]

export const dashboardNavItem: SiteNavItem = {
  label: 'لوحة التحكم',
  href: '/dashboard',
}
