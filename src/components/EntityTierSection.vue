<script setup lang="ts">
import EntityCard from '@/components/EntityCard.vue'
import type { Entity } from '@/composables/useEntities'
import { useLocalization } from '@/composables/useLocalization'
import { interpolate } from '@/composables/useQuiz'

withDefaults(
  defineProps<{
    tier: number
    entities: Entity[]
    compact?: boolean
    hideTitle?: boolean
  }>(),
  {
    compact: false,
    hideTitle: false,
  },
)

const { t } = useLocalization()

function tierLabel(tier: number): string {
  const specificKey = `country.entities.tier.${tier}`
  const specific = t(specificKey)
  if (specific !== specificKey) return specific
  return interpolate(t('country.entities.tier'), { tier })
}
</script>

<template>
  <section class="entity-tier" :class="{ 'entity-tier--compact': compact }">
    <h2 v-if="!hideTitle" class="entity-tier__title">{{ tierLabel(tier) }}</h2>
    <div class="entity-tier__list">
      <EntityCard
        v-for="entity in entities"
        :key="entity.entityId"
        :entity="entity"
        :compact="compact"
      />
    </div>
  </section>
</template>

<style scoped>
.entity-tier {
  margin-top: 0;
}

.entity-tier__title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #667085;
}

.entity-tier__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.entity-tier--compact .entity-tier__title {
  margin-bottom: 0.35rem;
}

.entity-tier--compact .entity-tier__list {
  gap: 0.4rem;
}
</style>
