import type { Locale } from '@/composables/useLocalization'
import type { Entity } from '@/composables/useEntities'

export type EntityReferenceSource = 'wikipedia' | 'grokipedia' | 'britannica'

export interface WikipediaSummary {
  title: string
  extract: string
  thumbnailUrl: string | null
  pageUrl: string
}

export interface EntityReferenceLink {
  source: EntityReferenceSource
  url: string
}

const summaryCache = new Map<string, WikipediaSummary | null>()

export function localeToWikipediaLang(locale: Locale): string {
  if (locale === 'pirate') return 'en'
  return locale
}

export async function fetchWikipediaSummary(
  title: string,
  locale: Locale,
): Promise<WikipediaSummary | null> {
  const primaryLang = localeToWikipediaLang(locale)
  const cached = summaryCache.get(`${primaryLang}:${title}`)
  if (cached !== undefined) return cached

  const primary = await fetchWikipediaSummaryForLang(title, primaryLang)
  if (primary) {
    summaryCache.set(`${primaryLang}:${title}`, primary)
    return primary
  }

  if (primaryLang !== 'en') {
    const fallback = await fetchWikipediaSummaryForLang(title, 'en')
    summaryCache.set(`${primaryLang}:${title}`, fallback)
    if (fallback) {
      summaryCache.set(`en:${title}`, fallback)
    }
    return fallback
  }

  summaryCache.set(`${primaryLang}:${title}`, null)
  return null
}

async function fetchWikipediaSummaryForLang(
  title: string,
  lang: string,
): Promise<WikipediaSummary | null> {
  const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'))
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data = (await response.json()) as {
      title?: string
      extract?: string
      content_urls?: { desktop?: { page?: string } }
      thumbnail?: { source?: string }
    }

    if (!data.extract) return null

    return {
      title: data.title ?? title,
      extract: data.extract,
      thumbnailUrl: data.thumbnail?.source ?? null,
      pageUrl: data.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodedTitle}`,
    }
  } catch {
    return null
  }
}

function wikipediaUrl(title: string, locale: Locale): string {
  const lang = localeToWikipediaLang(locale)
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
}

export function getEntityReferenceLinks(
  entity: Entity,
  locale: Locale = 'en',
): EntityReferenceLink[] {
  const links: EntityReferenceLink[] = []

  if (entity.wikipediaTitle) {
    links.push({ source: 'wikipedia', url: wikipediaUrl(entity.wikipediaTitle, locale) })
  }
  if (entity.grokipediaUrl) {
    links.push({ source: 'grokipedia', url: entity.grokipediaUrl })
  }
  if (entity.britannicaUrl) {
    links.push({ source: 'britannica', url: entity.britannicaUrl })
  }

  return links
}

export function clearReferencePreviewCache(): void {
  summaryCache.clear()
}
