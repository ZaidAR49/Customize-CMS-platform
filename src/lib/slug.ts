/** Normalize URL slug segments for consistent DB lookups (Arabic, encoding, slashes). */
export function normalizeSlug(raw: string): string {
  let slug = raw.trim().replace(/^\/+|\/+$/g, '')

  if (slug.includes('%')) {
    try {
      slug = decodeURIComponent(slug)
    } catch {
      /* already decoded */
    }
  }

  return slug.normalize('NFC')
}
