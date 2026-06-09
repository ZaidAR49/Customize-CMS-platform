export function getPublicPostUrl(slug: string, locale?: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  const prefix = locale && locale !== 'ar' ? `/${locale}` : ''
  return `${base}${prefix}/news/${encodeURIComponent(slug)}`
}
