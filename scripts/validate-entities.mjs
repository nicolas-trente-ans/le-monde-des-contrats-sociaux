/**
 * Validate entity CSV data against countries and localization keys.
 * Usage: node scripts/validate-entities.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv } from './lib/quiz-score-rebalance.mjs'

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
  const records = rowsToObjects(rows)
  return new Set(records.map((row) => row.key.trim()).filter(Boolean))
}

function loadCountryCodes() {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, 'countries.csv'), 'utf8'))
  const records = rowsToObjects(rows)
  return new Set(
    records.map((row) => row.country_code.trim().toUpperCase()).filter(Boolean),
  )
}

function loadEntities() {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, 'entities.csv'), 'utf8'))
  return rowsToObjects(rows).filter((row) => row.entity_id?.trim())
}

function loadCountryEntities() {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8'))
  return rowsToObjects(rows).filter((row) => row.country_code?.trim() && row.entity_id?.trim())
}

function loadRelationships() {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8'))
  return rowsToObjects(rows).filter(
    (row) => row.country_code?.trim() && row.from_entity_id?.trim() && row.to_entity_id?.trim(),
  )
}

const localizationKeys = loadLocalizationKeys()
const countryCodes = loadCountryCodes()
const entities = loadEntities()
const entityIds = new Set(entities.map((row) => row.entity_id.trim()))
const countryEntities = loadCountryEntities()
const relationships = loadRelationships()

let issues = 0

function report(message) {
  console.error(message)
  issues += 1
}

for (const entity of entities) {
  const id = entity.entity_id.trim()
  for (const key of [entity.name_key, entity.description_key]) {
    const trimmed = key?.trim()
    if (!trimmed || !localizationKeys.has(trimmed)) {
      report(`Missing localization key "${trimmed}" for entity ${id}`)
    }
  }

  const linked = entity.linked_country_code?.trim().toUpperCase()
  if (linked && !countryCodes.has(linked)) {
    report(`Entity ${id} links to unknown country code ${linked}`)
  }
}

for (const row of countryEntities) {
  const entityId = row.entity_id.trim()
  const countryCode = row.country_code.trim().toUpperCase()

  if (!entityIds.has(entityId)) {
    report(`country_entities references unknown entity_id ${entityId}`)
  }
  if (!countryCodes.has(countryCode)) {
    report(`country_entities references unknown country_code ${countryCode}`)
  }

  const tier = Number.parseInt(row.tier, 10)
  const priority = Number.parseInt(row.priority, 10)
  if (Number.isNaN(tier) || tier < 1) {
    report(`country_entities ${countryCode}/${entityId} has invalid tier`)
  }
  if (Number.isNaN(priority)) {
    report(`country_entities ${countryCode}/${entityId} has invalid priority`)
  }
}

for (const row of relationships) {
  const fromId = row.from_entity_id.trim()
  const toId = row.to_entity_id.trim()
  const countryCode = row.country_code.trim().toUpperCase()
  const relationshipKey = row.relationship_key?.trim()

  if (!entityIds.has(fromId)) {
    report(`entity_relationships references unknown from_entity_id ${fromId}`)
  }
  if (!entityIds.has(toId)) {
    report(`entity_relationships references unknown to_entity_id ${toId}`)
  }
  if (!countryCodes.has(countryCode)) {
    report(`entity_relationships references unknown country_code ${countryCode}`)
  }
  if (!relationshipKey || !localizationKeys.has(relationshipKey)) {
    report(`Missing localization key "${relationshipKey}" for relationship ${fromId} -> ${toId}`)
  }
}

if (issues > 0) {
  console.error(`\n${issues} validation issue(s) found.`)
  process.exit(1)
}

console.log(
  `Entity data OK: ${entities.length} entities, ${countryEntities.length} country mappings, ${relationships.length} relationships.`,
)
