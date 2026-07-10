<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { countryDescriptionKey, countryLabelKey, useCountries } from '@/composables/useCountries'
import { useLocalization } from '@/composables/useLocalization'

const route = useRoute()
const router = useRouter()
const { ready, error, getCountry } = useCountries()
const { t } = useLocalization()

const countryCode = computed(() => String(route.params.code ?? '').toUpperCase())

const country = computed(() => {
  if (!ready.value) return undefined
  return getCountry(countryCode.value)
})

watch([ready, country], ([isReady, resolvedCountry]) => {
  if (isReady && !resolvedCountry) {
    router.replace({ name: 'not-found' })
  }
})
</script>

<template>
  <section class="country">
    <header class="country__header">
      <RouterLink class="country__back" to="/">{{ t('country.back') }}</RouterLink>
    </header>

    <p v-if="error" class="country__error">{{ error }}</p>
    <p v-else-if="!ready" class="country__loading">{{ t('country.loading') }}</p>

    <article v-else-if="country" class="country__content">
      <h1>{{ t(countryLabelKey(country.countryCode)) }}</h1>
      <p class="country__description">{{ t(countryDescriptionKey(country.countryCode)) }}</p>
      <img
        class="country__image"
        :src="country.imageUrl"
        :alt="t(countryLabelKey(country.countryCode))"
      />
    </article>
  </section>
</template>

<style scoped>
.country__header {
  margin-bottom: 1.25rem;
}

.country__back {
  color: #175cd3;
  text-decoration: none;
  font-weight: 600;
}

.country__back:hover {
  text-decoration: underline;
}

.country__content h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

.country__description {
  margin: 0 0 1.25rem;
  max-width: 70ch;
  color: #344054;
}

.country__image {
  display: block;
  width: min(960px, 100%);
  height: auto;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(16 24 40 / 12%);
}

.country__loading,
.country__error {
  margin: 0;
}

.country__error {
  color: #b42318;
}
</style>
