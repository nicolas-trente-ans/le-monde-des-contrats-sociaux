<script setup lang="ts">
import { ref } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import MemeModal from '@/components/MemeModal.vue'
import WorldMap from '@/components/WorldMap.vue'
import type { CountryMeme } from '@/composables/useCountries'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
const selectedCountry = ref<CountryMeme | null>(null)

function onSelectCountry(country: CountryMeme) {
  selectedCountry.value = country
}
</script>

<template>
  <section class="home">
    <header class="home__header">
      <div>
        <h1>{{ t('site.title') }}</h1>
        <p class="home__hint">{{ t('map.hover_hint') }} · {{ t('map.click_hint') }}</p>
      </div>
      <LanguageSelector />
    </header>

    <WorldMap @select="onSelectCountry" />
    <MemeModal :country="selectedCountry" @close="selectedCountry = null" />
  </section>
</template>

<style scoped>
.home__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.home__header h1 {
  margin: 0 0 0.35rem;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

.home__hint {
  margin: 0;
  color: #475467;
}
</style>
