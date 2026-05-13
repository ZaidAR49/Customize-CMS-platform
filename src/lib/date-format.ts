/** Site-wide English (US) formatting for dates, times, and numbers. */
export const SITE_LOCALE = 'en-US' as const

const dateLong: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const dateTimeMedium: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
}

export function formatSiteDate(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleDateString(SITE_LOCALE, dateLong)
}

export function formatSiteDateTime(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleString(SITE_LOCALE, dateTimeMedium)
}

export function formatSiteNumber(value: number): string {
  return value.toLocaleString(SITE_LOCALE)
}
