<script setup lang="ts">
import WorldMap from '@/components/WorldMap.vue'
import { useMemePreview } from '@/composables/useMemePreview'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
const { openPreview } = useMemePreview()
</script>

<template>
  <section class="home">
    <header class="home__header">
      <h1>{{ t('site.title') }}</h1>
      <p class="home__hint">
        {{ t('map.hover_hint') }} · {{ t('map.click_hint') }} · {{ t('map.open_country') }}
      </p>
    </header>

    <WorldMap @select="openPreview" />
  </section>
</template>

<style scoped>
.home__header {
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
