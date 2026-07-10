<script setup lang="ts">
import { RouterLink } from 'vue-router'
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
      <p class="home__quiz-cta">
        {{ t('home.quiz_cta_prefix') }}
        <RouterLink to="/quiz">{{ t('home.quiz_cta_link') }}</RouterLink>
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

.home__quiz-cta {
  margin: 0.75rem 0 0;
  color: #475467;
}

.home__quiz-cta a {
  color: #175cd3;
  font-weight: 600;
  text-decoration: none;
}

.home__quiz-cta a:hover {
  text-decoration: underline;
}
</style>
