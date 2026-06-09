export function getPublicPostUrl(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/news/${encodeURIComponent(slug)}`
}
