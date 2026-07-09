<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CountryMeme } from '@/composables/useCountries'
import { countryLabelKey } from '@/composables/useCountries'
import { useLocalization } from '@/composables/useLocalization'
import { countryRoutePath } from '@/utils/csv'

const props = defineProps<{
  country: CountryMeme | null
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const router = useRouter()
const { t } = useLocalization()

function close() {
  document.body.style.overflow = ''
  emit('close')
}

function openCountryPage() {
  if (!props.country) return
  const path = countryRoutePath(props.country.countryCode)
  close()
  router.push(path)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.country,
  (country) => {
    document.body.style.overflow = country ? 'hidden' : ''
  },
)

watch(
  () => route.fullPath,
  () => {
    if (props.country) close()
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="country" class="meme-preview" @click.self="close">
      <div class="meme-preview__dialog" role="dialog" aria-modal="true">
        <header class="meme-preview__header">
          <h2>{{ t(countryLabelKey(country.countryCode)) }}</h2>
          <button type="button" class="meme-preview__close" aria-label="Close" @click="close">
            ×
          </button>
        </header>

        <button
type="button" class="meme-preview__image-button" :aria-label="t('map.open_country')"
          @click="openCountryPage">
          <img class="meme-preview__image" :src="country.imageUrl" :alt="t(countryLabelKey(country.countryCode))" />
          <span class="meme-preview__hint">{{ t('map.open_country') }}</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.meme-preview {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(10 16 30 / 72%);
  backdrop-filter: blur(2px);
}

.meme-preview__dialog {
  width: min(720px, 100%);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 25%);
}

.meme-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem 0.5rem;
}

.meme-preview__header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.meme-preview__close {
  border: 0;
  background: transparent;
  font-size: 1.75rem;
  line-height: 1;
  color: #475467;
}

.meme-preview__image-button {
  display: block;
  width: 100%;
  padding: 0 1.25rem 1.25rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.meme-preview__image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.meme-preview__image-button:hover .meme-preview__image,
.meme-preview__image-button:focus-visible .meme-preview__image {
  transform: scale(1.01);
  box-shadow: 0 8px 24px rgb(16 24 40 / 16%);
}

.meme-preview__hint {
  display: block;
  margin-top: 0.75rem;
  color: #175cd3;
  font-size: 0.95rem;
  font-weight: 600;
}
</style>
