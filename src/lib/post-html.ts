const HTML_BLOCK_TAG = /<(h[1-6]|p|div|ul|ol|li|blockquote|table|br)\b/i

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeHtmlEntities(text: string): string {
  if (!text.includes('&lt;') && !text.includes('&gt;') && !text.includes('&amp;')) {
    return text
  }
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function plainTextToHtml(text: string): string {
  const lines = text.split(/\r?\n/)
  const blocks: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const h1 = trimmed.match(/^#\s+(.+)$/)
    if (h1) {
      blocks.push(`<h1>${escapeHtml(h1[1])}</h1>`)
      continue
    }

    const h2 = trimmed.match(/^##\s+(.+)$/)
    if (h2) {
      blocks.push(`<h2>${escapeHtml(h2[1])}</h2>`)
      continue
    }

    const h3 = trimmed.match(/^###\s+(.+)$/)
    if (h3) {
      blocks.push(`<h3>${escapeHtml(h3[1])}</h3>`)
      continue
    }

    blocks.push(`<p>${escapeHtml(trimmed)}</p>`)
  }

  return blocks.join('\n')
}

/** Normalize post body for dangerouslySetInnerHTML (HTML or simple markdown). */
export function preparePostHtml(raw: string | null | undefined): string {
  const text = decodeHtmlEntities((raw ?? '').trim())
  if (!text) return ''

  if (HTML_BLOCK_TAG.test(text)) {
    return text
  }

  return plainTextToHtml(text)
}
