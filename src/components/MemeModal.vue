<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import type { CountryMeme } from '@/composables/useCountries'
import { useCountries } from '@/composables/useCountries'
import { useLocalization } from '@/composables/useLocalization'

const props = defineProps<{
  country: CountryMeme | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { getLabel } = useCountries()
const { locale } = useLocalization()

function close() {
  emit('close')
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
    <div v-if="country" class="meme-modal" @click.self="close">
      <div class="meme-modal__dialog" role="dialog" aria-modal="true">
        <header class="meme-modal__header">
          <h2>{{ getLabel(country, locale) }}</h2>
          <button type="button" class="meme-modal__close" aria-label="Close" @click="close">
            ×
          </button>
        </header>
        <img class="meme-modal__image" :src="country.imageUrl" :alt="getLabel(country, locale)" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.meme-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(10 16 30 / 72%);
  backdrop-filter: blur(2px);
}

.meme-modal__dialog {
  width: min(960px, 100%);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 25%);
}

.meme-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem 0.5rem;
}

.meme-modal__header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.meme-modal__close {
  border: 0;
  background: transparent;
  font-size: 1.75rem;
  line-height: 1;
  color: #475467;
}

.meme-modal__image {
  display: block;
  width: 100%;
  height: auto;
  padding: 0 1.25rem 1.25rem;
}
</style>
