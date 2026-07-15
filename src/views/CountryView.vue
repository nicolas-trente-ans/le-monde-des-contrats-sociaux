<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import EntityRelationshipList from '@/components/EntityRelationshipList.vue'
import EntityTierSection from '@/components/EntityTierSection.vue'
import { countryDescriptionKey, countryLabelKey, useCountries } from '@/composables/useCountries'
import type { Entity } from '@/composables/useEntities'
import { useEntities } from '@/composables/useEntities'
import { useLocalization } from '@/composables/useLocalization'
import { countryRoutePath } from '@/utils/csv'

const route = useRoute()
const router = useRouter()
const { ready, error, getCountry } = useCountries()
const { ready: entitiesReady, getEntitiesForCountry, getRelationshipsForCountry, getSeeAlsoCountries } = useEntities()
const { t } = useLocalization()

const countryCode = computed(() => String(route.params.code ?? '').toUpperCase())

const country = computed(() => {
  if (!ready.value) return undefined
  return getCountry(countryCode.value)
})

const entityGroups = computed(() => {
  if (!entitiesReady.value) return []
  return getEntitiesForCountry(countryCode.value)
})

const relationships = computed(() => {
  if (!entitiesReady.value) return []
  return getRelationshipsForCountry(countryCode.value)
})

const hasEntities = computed(() => entityGroups.value.length > 0)

const seeAlsoCountries = computed(() => {
  if (!entitiesReady.value || !ready.value) return []
  return getSeeAlsoCountries(countryCode.value).filter((code) => Boolean(getCountry(code)))
})

function entitiesForTier(tier: number): Entity[] {
  return entityGroups.value.find((group) => group.tier === tier)?.entities ?? []
}

const tier1Entities = computed(() => entitiesForTier(1))
const tier2Entities = computed(() => entitiesForTier(2))
const tier3Entities = computed(() => entitiesForTier(3))

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

      <nav v-if="seeAlsoCountries.length > 0" class="country__see-also" aria-label="See also">
        <span class="country__see-also-label">{{ t('country.see_also') }}:</span>
        <template v-for="(linkedCode, index) in seeAlsoCountries" :key="linkedCode">
          <span v-if="index > 0" class="country__see-also-sep">,</span>
          <RouterLink class="country__see-also-link" :to="countryRoutePath(linkedCode)">
            {{ t(countryLabelKey(linkedCode)) }}
          </RouterLink>
        </template>
      </nav>

      <div v-if="hasEntities" class="country__explorer">
        <div class="country__hero">
          <div class="country__center">
            <img
              class="country__image"
              :src="country.imageUrl"
              :alt="t(countryLabelKey(country.countryCode))"
            />
            <p
              class="country__description"
              v-html="t(countryDescriptionKey(country.countryCode))"
            ></p>
          </div>

          <aside v-if="tier1Entities.length > 0 || tier2Entities.length > 0" class="country__aside">
            <EntityTierSection
              v-if="tier1Entities.length > 0"
              :tier="1"
              :entities="tier1Entities"
              compact
            />
            <EntityTierSection
              v-if="tier2Entities.length > 0"
              :tier="2"
              :entities="tier2Entities"
              compact
            />
          </aside>
        </div>

        <div v-if="tier3Entities.length > 0" class="country__below">
          <EntityTierSection :tier="3" :entities="tier3Entities" compact />
        </div>

        <EntityRelationshipList :relationships="relationships" />
      </div>

      <template v-else>
        <img
          class="country__image"
          :src="country.imageUrl"
          :alt="t(countryLabelKey(country.countryCode))"
        />
        <p
          class="country__description"
          v-html="t(countryDescriptionKey(country.countryCode))"
        ></p>
      </template>
    </article>
  </section>
</template>

<style scoped>
.country__header {
  margin-bottom: 1rem;
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
  margin: 0 0 0.35rem;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
}

.country__see-also {
  margin: 0 0 1rem;
  color: #475467;
  font-size: 0.9rem;
  line-height: 1.5;
}

.country__see-also-label {
  margin-right: 0.35rem;
}

.country__see-also-sep {
  margin-right: 0.25rem;
}

.country__see-also-link {
  color: #175cd3;
  font-weight: 600;
  text-decoration: none;
}

.country__see-also-link:hover {
  text-decoration: underline;
}

.country__explorer {
  max-width: 1200px;
}

.country__hero {
  display: grid;
  grid-template-columns: minmax(280px, 2.5fr) minmax(180px, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.country__aside {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.country__center {
  min-width: 0;
}

.country__image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgb(16 24 40 / 10%);
}

.country__description {
  margin: 0.65rem 0 0;
  color: #475467;
  font-size: 0.88rem;
  line-height: 1.5;
}

.country__description :deep(a) {
  color: #175cd3;
  font-weight: 600;
  text-decoration: none;
}

.country__description :deep(a:hover) {
  text-decoration: underline;
}

.country__below {
  margin-top: 0.85rem;
}

.country__below :deep(.entity-tier__list) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.4rem;
}

.country__loading,
.country__error {
  margin: 0;
}

.country__error {
  color: #b42318;
}

@media (max-width: 960px) {
  .country__hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .country__below :deep(.entity-tier__list) {
    grid-template-columns: 1fr;
  }
}
</style>
