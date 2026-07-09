import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import { assetUrl, parseCsv, rowsToObjects } from '@/utils/csv'

export interface CountryMeme {
  countryCode: string
  imageFile: string
  imageUrl: string
}

interface CountriesContext {
  countries: Ref<Map<string, CountryMeme>>
  ready: Ref<boolean>
  error: Ref<string | null>
  getCountry: (code: string) => CountryMeme | undefined
}

const countriesKey: InjectionKey<CountriesContext> = Symbol('countries')

async function loadCountries(): Promise<Map<string, CountryMeme>> {
  const response = await fetch(assetUrl('data/countries.csv'))
  if (!response.ok) {
    throw new Error(`Failed to load countries CSV (${response.status})`)
  }

  const rows = parseCsv(await response.text())
  const records = rowsToObjects<'country_code' | 'image_file'>(rows)

  const map = new Map<string, CountryMeme>()
  for (const row of records) {
    const countryCode = row.country_code.trim().toUpperCase()
    if (!countryCode) continue

    map.set(countryCode, {
      countryCode,
      imageFile: row.image_file.trim(),
      imageUrl: assetUrl(`images/${row.image_file.trim()}`),
    })
  }

  return map
}

export function provideCountries(): CountriesContext {
  const countries = ref<Map<string, CountryMeme>>(new Map())
  const ready = ref(false)
  const error = ref<string | null>(null)

  loadCountries()
    .then((data) => {
      countries.value = data
      ready.value = true
    })
    .catch((err: unknown) => {
      error.value = err instanceof Error ? err.message : 'Failed to load countries'
    })

  const getCountry = (code: string) => countries.value.get(code.toUpperCase())

  const context: CountriesContext = { countries, ready, error, getCountry }
  provide(countriesKey, context)
  return context
}

export function useCountries(): CountriesContext {
  const context = inject(countriesKey)
  if (!context) {
    throw new Error('useCountries must be used after provideCountries')
  }
  return context
}

export function countryLabelKey(countryCode: string): string {
  return `country.${countryCode.toUpperCase()}.label`
}

export function countryDescriptionKey(countryCode: string): string {
  return `country.${countryCode.toUpperCase()}.description`
}
