<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { Entity } from '@/composables/useEntities'
import { countryLabelKey, useCountries } from '@/composables/useCountries'
import { useLocalization } from '@/composables/useLocalization'
import { countryRoutePath } from '@/utils/csv'
import {
  fetchWikipediaSummary,
  getEntityReferenceLinks,
  type WikipediaSummary,
} from '@/utils/referencePreview'

const props = withDefaults(
  defineProps<{
    entity: Entity
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const { t, locale } = useLocalization()
const { getCountry } = useCountries()

const previewLoading = ref(false)
const wikipediaPreview = ref<WikipediaSummary | null>(null)
const previewFailed = ref(false)

const linkedCountry = computed(() => {
  if (!props.entity.linkedCountryCode) return undefined
  return getCountry(props.entity.linkedCountryCode)
})

const referenceLinks = computed(() => getEntityReferenceLinks(props.entity, locale.value))

const showWikipediaPreview = computed(() => Boolean(props.entity.wikipediaTitle))

async function loadPreview() {
  if (!props.entity.wikipediaTitle) {
    wikipediaPreview.value = null
    previewFailed.value = false
    return
  }

  previewLoading.value = true
  previewFailed.value = false
  const summary = await fetchWikipediaSummary(props.entity.wikipediaTitle, locale.value)
  wikipediaPreview.value = summary
  previewFailed.value = !summary
  previewLoading.value = false
}

onMounted(loadPreview)
watch([() => props.entity.wikipediaTitle, locale], loadPreview)
</script>

<template>
  <article class="entity-card" :class="{ 'entity-card--compact': compact }">
    <div class="entity-card__body">
      <div class="entity-card__content">
        <div class="entity-card__heading">
          <h3 class="entity-card__name">{{ t(entity.nameKey) }}</h3>
          <RouterLink
            v-if="linkedCountry"
            class="entity-card__country-link"
            :to="countryRoutePath(linkedCountry.countryCode)"
          >
            {{ t(countryLabelKey(linkedCountry.countryCode)) }}
          </RouterLink>
        </div>

        <p class="entity-card__description" v-html="t(entity.descriptionKey)"></p>

        <div v-if="referenceLinks.length > 0" class="entity-card__references">
          <a
            v-for="link in referenceLinks"
            :key="link.source"
            class="entity-card__reference"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t(`reference.${link.source}`) }}
          </a>
        </div>
      </div>

      <img
        v-if="entity.imageUrl"
        class="entity-card__image"
        :src="entity.imageUrl"
        :alt="t(entity.nameKey)"
      />
    </div>

    <div v-if="showWikipediaPreview && !compact" class="entity-card__preview">
      <p v-if="previewLoading" class="entity-card__preview-status">
        {{ t('country.entities.preview.loading') }}
      </p>
      <template v-else-if="wikipediaPreview">
        <img
          v-if="wikipediaPreview.thumbnailUrl"
          class="entity-card__preview-thumb"
          :src="wikipediaPreview.thumbnailUrl"
          :alt="wikipediaPreview.title"
        />
        <p class="entity-card__preview-text">{{ wikipediaPreview.extract }}</p>
      </template>
      <p v-else-if="previewFailed" class="entity-card__preview-status">
        {{ t('country.entities.preview.unavailable') }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.entity-card {
  padding: 0.75rem;
  border: 1px solid #dbe2ef;
  border-radius: 6px;
  background: #fff;
}

.entity-card--compact {
  padding: 0.5rem 0.6rem;
}

.entity-card__body {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}

.entity-card__content {
  flex: 1;
  min-width: 0;
}

.entity-card__heading {
  margin-bottom: 0.25rem;
}

.entity-card--compact .entity-card__heading {
  margin-bottom: 0.2rem;
}

.entity-card__image {
  width: 44px;
  height: 44px;
  object-fit: contain;
  object-position: top right;
  flex-shrink: 0;
}

.entity-card--compact .entity-card__image {
  width: 36px;
  height: 36px;
}

.entity-card__name {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.3;
}

.entity-card--compact .entity-card__name {
  font-size: 0.82rem;
}

.entity-card__country-link {
  display: inline-block;
  margin-top: 0.15rem;
  color: #175cd3;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
}

.entity-card__country-link:hover {
  text-decoration: underline;
}

.entity-card__description {
  margin: 0 0 0.4rem;
  color: #475467;
  font-size: 0.8rem;
  line-height: 1.4;
}

.entity-card__description :deep(a) {
  color: #175cd3;
  font-weight: 600;
  text-decoration: none;
}

.entity-card__description :deep(a:hover) {
  text-decoration: underline;
}

.entity-card--compact .entity-card__description {
  margin-bottom: 0.3rem;
  font-size: 0.75rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entity-card__references {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.6rem;
}

.entity-card__reference {
  color: #175cd3;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
}

.entity-card__reference:hover {
  text-decoration: underline;
}

.entity-card__preview {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eef2f7;
}

.entity-card__preview-thumb {
  display: block;
  width: 100%;
  max-width: 200px;
  height: auto;
  margin-bottom: 0.5rem;
  border-radius: 6px;
}

.entity-card__preview-text {
  margin: 0;
  color: #475467;
  font-size: 0.9rem;
  line-height: 1.5;
}

.entity-card__preview-status {
  margin: 0;
  color: #667085;
  font-size: 0.9rem;
  font-style: italic;
}
</style>
