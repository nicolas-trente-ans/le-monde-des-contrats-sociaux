import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import type { CountryMeme } from '@/composables/useCountries'

interface MemePreviewContext {
  previewCountry: Ref<CountryMeme | null>
  openPreview: (country: CountryMeme) => void
  closePreview: () => void
}

const memePreviewKey: InjectionKey<MemePreviewContext> = Symbol('memePreview')

export function provideMemePreview(): MemePreviewContext {
  const previewCountry = ref<CountryMeme | null>(null)

  const openPreview = (country: CountryMeme) => {
    previewCountry.value = country
  }

  const closePreview = () => {
    previewCountry.value = null
    document.body.style.overflow = ''
  }

  const context: MemePreviewContext = { previewCountry, openPreview, closePreview }
  provide(memePreviewKey, context)
  return context
}

export function useMemePreview(): MemePreviewContext {
  const context = inject(memePreviewKey)
  if (!context) {
    throw new Error('useMemePreview must be used after provideMemePreview')
  }
  return context
}
