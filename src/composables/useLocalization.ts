import { computed, inject, provide, ref, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { assetUrl, parseCsv, rowsToObjects } from '@/utils/csv'

export type Locale = 'en' | 'fr' | 'hu' | 'pirate'

type LocalizationEntry = Record<Locale, string>
type LocalizationMap = Record<string, LocalizationEntry>

const LOCALE_KEY = 'nicolas-locale'
const LOCALES: Locale[] = ['en', 'fr', 'hu', 'pirate']

interface LocalizationContext {
  locale: Ref<Locale>
  ready: Ref<boolean>
  error: Ref<string | null>
  setLocale: (next: Locale) => void
  t: (key: string) => string
}

const localizationKey: InjectionKey<LocalizationContext> = Symbol('localization')

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY)
  if (stored && LOCALES.includes(stored as Locale)) {
    return stored as Locale
  }
  return 'en'
}

async function loadLocalization(): Promise<LocalizationMap> {
  const response = await fetch(assetUrl('data/Localization.csv'))
  if (!response.ok) {
    throw new Error(`Failed to load localization CSV (${response.status})`)
  }

  const rows = parseCsv(await response.text())
  const records = rowsToObjects<'key' | 'en' | 'fr' | 'hu' | 'pirate'>(rows)

  return records.reduce<LocalizationMap>((acc, row) => {
    acc[row.key] = { en: row.en, fr: row.fr, hu: row.hu, pirate: row.pirate }
    return acc
  }, {})
}

export function provideLocalization(): LocalizationContext {
  const locale = ref<Locale>(readStoredLocale())
  const ready = ref(false)
  const error = ref<string | null>(null)
  const strings = ref<LocalizationMap>({})

  const setLocale = (next: Locale) => {
    locale.value = next
    localStorage.setItem(LOCALE_KEY, next)
  }

  const t = (key: string): string => {
    const entry = strings.value[key]
    if (!entry) return key
    return entry[locale.value] ?? entry.en ?? key
  }

  loadLocalization()
    .then((data) => {
      strings.value = data
      ready.value = true
    })
    .catch((err: unknown) => {
      error.value = err instanceof Error ? err.message : 'Failed to load localization'
    })

  const context: LocalizationContext = { locale, ready, error, setLocale, t }
  provide(localizationKey, context)
  return context
}

export function useLocalization(): {
  locale: Ref<Locale>
  ready: Ref<boolean>
  error: Ref<string | null>
  setLocale: (next: Locale) => void
  t: (key: string) => string
} {
  const context = inject(localizationKey)
  if (!context) {
    throw new Error('useLocalization must be used after provideLocalization')
  }
  return context
}

export function useLocalizedTitle(titleKey: string): ComputedRef<string> {
  const { t } = useLocalization()
  return computed(() => t(titleKey))
}
