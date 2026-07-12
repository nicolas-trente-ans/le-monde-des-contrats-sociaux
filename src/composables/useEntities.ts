import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import { assetUrl, parseCsv, rowsToObjects } from '@/utils/csv'

export interface Entity {
  entityId: string
  nameKey: string
  descriptionKey: string
  imageFile: string | null
  imageUrl: string | null
  wikipediaTitle: string | null
  grokipediaUrl: string | null
  britannicaUrl: string | null
  linkedCountryCode: string | null
}

export interface CountryEntityRef {
  countryCode: string
  entityId: string
  tier: number
  priority: number
}

export interface EntityRelationship {
  countryCode: string
  fromEntityId: string
  toEntityId: string
  relationshipKey: string
}

export interface CountryEntityGroup {
  tier: number
  entities: Entity[]
}

interface EntitiesContext {
  entities: Ref<Map<string, Entity>>
  countryEntities: Ref<CountryEntityRef[]>
  relationships: Ref<EntityRelationship[]>
  ready: Ref<boolean>
  error: Ref<string | null>
  resolveEntity: (entityId: string) => Entity | undefined
  getEntitiesForCountry: (countryCode: string) => CountryEntityGroup[]
  getRelationshipsForCountry: (countryCode: string) => EntityRelationship[]
  getSeeAlsoCountries: (countryCode: string, limit?: number) => string[]
}

const entitiesKey: InjectionKey<EntitiesContext> = Symbol('entities')

function parseOptional(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

async function loadEntitiesCsv(): Promise<Map<string, Entity>> {
  const response = await fetch(assetUrl('data/entities.csv'))
  if (!response.ok) {
    throw new Error(`Failed to load entities CSV (${response.status})`)
  }

  const rows = parseCsv(await response.text())
  const records = rowsToObjects<
    | 'entity_id'
    | 'name_key'
    | 'description_key'
    | 'image_file'
    | 'wikipedia_title'
    | 'grokipedia_url'
    | 'britannica_url'
    | 'linked_country_code'
  >(rows)

  const map = new Map<string, Entity>()
  for (const row of records) {
    const entityId = row.entity_id.trim()
    if (!entityId) continue

    const imageFile = parseOptional(row.image_file)
    map.set(entityId, {
      entityId,
      nameKey: row.name_key.trim(),
      descriptionKey: row.description_key.trim(),
      imageFile,
      imageUrl: imageFile ? assetUrl(`images/entities/${imageFile}`) : null,
      wikipediaTitle: parseOptional(row.wikipedia_title),
      grokipediaUrl: parseOptional(row.grokipedia_url),
      britannicaUrl: parseOptional(row.britannica_url),
      linkedCountryCode: parseOptional(row.linked_country_code)?.toUpperCase() ?? null,
    })
  }

  return map
}

async function loadCountryEntitiesCsv(): Promise<CountryEntityRef[]> {
  const response = await fetch(assetUrl('data/country_entities.csv'))
  if (!response.ok) {
    throw new Error(`Failed to load country_entities CSV (${response.status})`)
  }

  const rows = parseCsv(await response.text())
  const records = rowsToObjects<'country_code' | 'entity_id' | 'tier' | 'priority'>(rows)

  return records
    .map((row) => ({
      countryCode: row.country_code.trim().toUpperCase(),
      entityId: row.entity_id.trim(),
      tier: Number.parseInt(row.tier.trim(), 10),
      priority: Number.parseInt(row.priority.trim(), 10),
    }))
    .filter((row) => row.countryCode && row.entityId && !Number.isNaN(row.tier) && !Number.isNaN(row.priority))
}

async function loadRelationshipsCsv(): Promise<EntityRelationship[]> {
  const response = await fetch(assetUrl('data/entity_relationships.csv'))
  if (!response.ok) {
    throw new Error(`Failed to load entity_relationships CSV (${response.status})`)
  }

  const rows = parseCsv(await response.text())
  const records = rowsToObjects<
    'country_code' | 'from_entity_id' | 'to_entity_id' | 'relationship_key'
  >(rows)

  return records
    .map((row) => ({
      countryCode: row.country_code.trim().toUpperCase(),
      fromEntityId: row.from_entity_id.trim(),
      toEntityId: row.to_entity_id.trim(),
      relationshipKey: row.relationship_key.trim(),
    }))
    .filter(
      (row) => row.countryCode && row.fromEntityId && row.toEntityId && row.relationshipKey,
    )
}

export function provideEntities(): EntitiesContext {
  const entities = ref<Map<string, Entity>>(new Map())
  const countryEntities = ref<CountryEntityRef[]>([])
  const relationships = ref<EntityRelationship[]>([])
  const ready = ref(false)
  const error = ref<string | null>(null)

  Promise.all([loadEntitiesCsv(), loadCountryEntitiesCsv(), loadRelationshipsCsv()])
    .then(([entityMap, countryRefs, relationshipRows]) => {
      entities.value = entityMap
      countryEntities.value = countryRefs
      relationships.value = relationshipRows
      ready.value = true
    })
    .catch((err: unknown) => {
      error.value = err instanceof Error ? err.message : 'Failed to load entities'
    })

  const resolveEntity = (entityId: string) => entities.value.get(entityId)

  const getEntitiesForCountry = (countryCode: string): CountryEntityGroup[] => {
    const code = countryCode.toUpperCase()
    const refs = countryEntities.value
      .filter((ref) => ref.countryCode === code)
      .sort((a, b) => a.tier - b.tier || a.priority - b.priority)

    const groups = new Map<number, Entity[]>()
    for (const ref of refs) {
      const entity = entities.value.get(ref.entityId)
      if (!entity) continue
      const list = groups.get(ref.tier) ?? []
      list.push(entity)
      groups.set(ref.tier, list)
    }

    return [...groups.entries()]
      .sort(([tierA], [tierB]) => tierA - tierB)
      .map(([tier, tierEntities]) => ({ tier, entities: tierEntities }))
  }

  const getRelationshipsForCountry = (countryCode: string): EntityRelationship[] => {
    const code = countryCode.toUpperCase()
    return relationships.value.filter((row) => row.countryCode === code)
  }

  const getSeeAlsoCountries = (countryCode: string, limit = 3): string[] => {
    const code = countryCode.toUpperCase()
    const refs = countryEntities.value
      .filter((ref) => ref.countryCode === code)
      .sort((a, b) => a.tier - b.tier || a.priority - b.priority)

    const seen = new Set<string>()
    const results: string[] = []

    for (const ref of refs) {
      const linked = entities.value.get(ref.entityId)?.linkedCountryCode
      if (!linked || linked === code || seen.has(linked)) continue
      seen.add(linked)
      results.push(linked)
      if (results.length >= limit) break
    }

    return results
  }

  const context: EntitiesContext = {
    entities,
    countryEntities,
    relationships,
    ready,
    error,
    resolveEntity,
    getEntitiesForCountry,
    getRelationshipsForCountry,
    getSeeAlsoCountries,
  }

  provide(entitiesKey, context)
  return context
}

export function useEntities(): EntitiesContext {
  const context = inject(entitiesKey)
  if (!context) {
    throw new Error('useEntities must be used after provideEntities')
  }
  return context
}

export function entityNameKey(entityId: string): string {
  return `entity.${entityId}.name`
}

export function entityDescriptionKey(entityId: string): string {
  return `entity.${entityId}.description`
}
