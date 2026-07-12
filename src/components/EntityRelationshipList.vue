<script setup lang="ts">
import { computed } from 'vue'
import type { EntityRelationship } from '@/composables/useEntities'
import { useEntities } from '@/composables/useEntities'
import { useLocalization } from '@/composables/useLocalization'

const props = defineProps<{
  relationships: EntityRelationship[]
}>()

const { t } = useLocalization()
const { resolveEntity } = useEntities()

const rows = computed(() =>
  props.relationships.map((relationship) => ({
    relationship,
    fromName: resolveEntity(relationship.fromEntityId)
      ? t(resolveEntity(relationship.fromEntityId)!.nameKey)
      : relationship.fromEntityId,
    toName: resolveEntity(relationship.toEntityId)
      ? t(resolveEntity(relationship.toEntityId)!.nameKey)
      : relationship.toEntityId,
    label: t(relationship.relationshipKey),
  })),
)
</script>

<template>
  <section v-if="rows.length > 0" class="entity-relationships">
    <h2 class="entity-relationships__title">{{ t('country.entities.relationships') }}</h2>
    <ul class="entity-relationships__list">
      <li v-for="(row, index) in rows" :key="index" class="entity-relationships__item">
        <span class="entity-relationships__from">{{ row.fromName }}</span>
        <span class="entity-relationships__arrow" aria-hidden="true">→</span>
        <span class="entity-relationships__label">{{ row.label }}</span>
        <span class="entity-relationships__arrow" aria-hidden="true">→</span>
        <span class="entity-relationships__to">{{ row.toName }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.entity-relationships {
  margin-top: 1rem;
}

.entity-relationships__title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #667085;
}

.entity-relationships__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.35rem;
}

.entity-relationships__item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid #e4e7ec;
  border-radius: 6px;
  background: #f9fafb;
  font-size: 0.78rem;
  line-height: 1.35;
}

.entity-relationships__from,
.entity-relationships__to {
  font-weight: 600;
  color: #101828;
}

.entity-relationships__label {
  color: #475467;
  font-style: italic;
}

.entity-relationships__arrow {
  color: #98a2b3;
}
</style>
