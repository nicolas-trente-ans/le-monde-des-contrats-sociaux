import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { parseCsv } from '../scripts/lib/quiz-score-rebalance.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '../public/assets/data')

function rowsToObjects(rows) {
  if (rows.length === 0) return []
  const [header, ...dataRows] = rows
  return dataRows.map((cells) => {
    const record = {}
    header.forEach((key, index) => {
      record[key] = cells[index] ?? ''
    })
    return record
  })
}

function loadLocalizationKeys() {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, 'Localization.csv'), 'utf8'))
  return new Set(rowsToObjects(rows).map((row) => row.key.trim()).filter(Boolean))
}

function loadCountryCodes() {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, 'countries.csv'), 'utf8'))
  return new Set(
    rowsToObjects(rows).map((row) => row.country_code.trim().toUpperCase()).filter(Boolean),
  )
}

test('entity CSV references are consistent', () => {
  const localizationKeys = loadLocalizationKeys()
  const countryCodes = loadCountryCodes()

  const entities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entities.csv'), 'utf8')),
  ).filter((row) => row.entity_id?.trim())

  const entityIds = new Set(entities.map((row) => row.entity_id.trim()))

  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  ).filter((row) => row.country_code?.trim() && row.entity_id?.trim())

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  ).filter((row) => row.country_code?.trim() && row.from_entity_id?.trim())

  assert.ok(entities.length > 0, 'expected at least one entity in pilot data')

  for (const entity of entities) {
    assert.ok(localizationKeys.has(entity.name_key.trim()))
    assert.ok(localizationKeys.has(entity.description_key.trim()))

    const linked = entity.linked_country_code?.trim().toUpperCase()
    if (linked) {
      assert.ok(countryCodes.has(linked), `unknown linked country ${linked}`)
    }
  }

  for (const row of countryEntities) {
    assert.ok(entityIds.has(row.entity_id.trim()))
    assert.ok(countryCodes.has(row.country_code.trim().toUpperCase()))
    const tier = Number.parseInt(row.tier, 10)
    const priority = Number.parseInt(row.priority, 10)
    assert.ok(tier >= 1)
    assert.ok(!Number.isNaN(priority))
  }

  for (const row of relationships) {
    assert.ok(entityIds.has(row.from_entity_id.trim()))
    assert.ok(entityIds.has(row.to_entity_id.trim()))
    assert.ok(countryCodes.has(row.country_code.trim().toUpperCase()))
    assert.ok(localizationKeys.has(row.relationship_key.trim()))
  }
})

test('US pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const usEntities = countryEntities.filter((row) => row.country_code.trim() === 'US')
  const tiers = new Set(usEntities.map((row) => row.tier.trim()))

  assert.ok(usEntities.length >= 10)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const usRelationships = relationships.filter((row) => row.country_code.trim() === 'US')
  assert.ok(usRelationships.length >= 5)
})
