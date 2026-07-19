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
  return new Set(
    rowsToObjects(rows)
      .map((row) => row.key.trim())
      .filter(Boolean),
  )
}

function loadCountryCodes() {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, 'countries.csv'), 'utf8'))
  return new Set(
    rowsToObjects(rows)
      .map((row) => row.country_code.trim().toUpperCase())
      .filter(Boolean),
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

  const entities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entities.csv'), 'utf8')),
  )
  const entityById = new Map(entities.map((row) => [row.entity_id.trim(), row]))
  const seeAlso = []
  const seen = new Set()
  for (const row of usEntities.sort(
    (a, b) => Number(a.tier) - Number(b.tier) || Number(a.priority) - Number(b.priority),
  )) {
    const linked = entityById.get(row.entity_id.trim())?.linked_country_code?.trim().toUpperCase()
    if (!linked || linked === 'US' || seen.has(linked)) continue
    seen.add(linked)
    seeAlso.push(linked)
    if (seeAlso.length >= 3) break
  }
  assert.deepEqual(seeAlso, ['IL', 'MX'])
})

test('AR pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const arEntities = countryEntities.filter((row) => row.country_code.trim() === 'AR')
  const tiers = new Set(arEntities.map((row) => row.tier.trim()))

  assert.ok(arEntities.length >= 10)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const arRelationships = relationships.filter((row) => row.country_code.trim() === 'AR')
  assert.ok(arRelationships.length >= 8)
})

test('AU pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const auEntities = countryEntities.filter((row) => row.country_code.trim() === 'AU')
  const tiers = new Set(auEntities.map((row) => row.tier.trim()))

  assert.ok(auEntities.length >= 12)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const auRelationships = relationships.filter((row) => row.country_code.trim() === 'AU')
  assert.ok(auRelationships.length >= 10)

  const entityIds = new Set(auEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('au.nick'))
  assert.ok(entityIds.has('au.australian_aid'))
  assert.ok(entityIds.has('au.centrelink'))
  assert.ok(entityIds.has('au.simon_linda'))
})

test('AT pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const atEntities = countryEntities.filter((row) => row.country_code.trim() === 'AT')
  const tiers = new Set(atEntities.map((row) => row.tier.trim()))

  assert.ok(atEntities.length >= 12)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const atRelationships = relationships.filter((row) => row.country_code.trim() === 'AT')
  assert.ok(atRelationships.length >= 20)

  const entityIds = new Set(atEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('at.franz'))
  assert.ok(entityIds.has('at.ada'))
  assert.ok(entityIds.has('at.wiener_wohnen'))
  assert.ok(entityIds.has('at.josef_marianne'))
  assert.ok(entityIds.has('at.aid_recipients'))
  assert.ok(entityIds.has('at.crime'))
  assert.ok(entityIds.has('at.electricity_prices'))

  const edgeKeys = new Set(
    atRelationships.map((row) => `${row.from_entity_id.trim()}->${row.to_entity_id.trim()}`),
  )
  assert.ok(edgeKeys.has('at.franz->at.abdul'))
  assert.ok(edgeKeys.has('at.ada->at.aid_recipients'))
  assert.ok(edgeKeys.has('at.spo->at.wiener_wohnen'))
  assert.ok(edgeKeys.has('at.abdul->at.crime'))
  assert.ok(edgeKeys.has('at.reumannplatz->at.child_prostitution'))
})

test('BR pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const brEntities = countryEntities.filter((row) => row.country_code.trim() === 'BR')
  const tiers = new Set(brEntities.map((row) => row.tier.trim()))

  assert.ok(brEntities.length >= 18)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const brRelationships = relationships.filter((row) => row.country_code.trim() === 'BR')
  assert.ok(brRelationships.length >= 20)

  const entityIds = new Set(brEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('br.pedro'))
  assert.ok(entityIds.has('br.bolsa_familia'))
  assert.ok(entityIds.has('br.latrocinio'))
  assert.ok(entityIds.has('br.nestor'))
  assert.ok(entityIds.has('br.funai'))

  const edgeKeys = new Set(
    brRelationships.map((row) => `${row.from_entity_id.trim()}->${row.to_entity_id.trim()}`),
  )
  assert.ok(edgeKeys.has('br.pedro->br.receita_federal'))
  assert.ok(edgeKeys.has('br.latrocinio->br.pedro'))
  assert.ok(edgeKeys.has('br.bolsa_familia->br.neide_deividsson'))
  assert.ok(edgeKeys.has('br.funai->br.iniguasu'))
  assert.ok(edgeKeys.has('br.armando->br.rolex'))
})

test('BG pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const bgEntities = countryEntities.filter((row) => row.country_code.trim() === 'BG')
  const tiers = new Set(bgEntities.map((row) => row.tier.trim()))

  assert.ok(bgEntities.length >= 14)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const bgRelationships = relationships.filter((row) => row.country_code.trim() === 'BG')
  assert.ok(bgRelationships.length >= 16)

  const entityIds = new Set(bgEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('bg.georgi'))
  assert.ok(entityIds.has('bg.nssi'))
  assert.ok(entityIds.has('bg.radka'))
  assert.ok(entityIds.has('bg.unknown'))
  assert.ok(entityIds.has('bg.excess'))

  const edgeKeys = new Set(
    bgRelationships.map((row) => `${row.from_entity_id.trim()}->${row.to_entity_id.trim()}`),
  )
  assert.ok(edgeKeys.has('bg.georgi->bg.nssi'))
  assert.ok(edgeKeys.has('bg.nssi->bg.ginka'))
  assert.ok(edgeKeys.has('bg.ginka->bg.phone_scams'))
  assert.ok(edgeKeys.has('bg.labour->bg.radka'))
  assert.ok(edgeKeys.has('bg.doctor->bg.excess'))
})

test('KH pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const khEntities = countryEntities.filter((row) => row.country_code.trim() === 'KH')
  const tiers = new Set(khEntities.map((row) => row.tier.trim()))

  assert.ok(khEntities.length >= 16)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const khRelationships = relationships.filter((row) => row.country_code.trim() === 'KH')
  assert.ok(khRelationships.length >= 18)

  const entityIds = new Set(khEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('kh.chea'))
  assert.ok(entityIds.has('kh.national_budget'))
  assert.ok(entityIds.has('kh.village_ministry'))
  assert.ok(entityIds.has('kh.sihanoukville'))
  assert.ok(entityIds.has('kh.shopee'))

  const edgeKeys = new Set(
    khRelationships.map((row) => `${row.from_entity_id.trim()}->${row.to_entity_id.trim()}`),
  )
  assert.ok(edgeKeys.has('kh.chea->kh.national_budget'))
  assert.ok(edgeKeys.has('kh.national_budget->kh.parliament'))
  assert.ok(edgeKeys.has('kh.smartphone->kh.sihanoukville'))
  assert.ok(edgeKeys.has('kh.temasek->kh.shopee'))
  assert.ok(edgeKeys.has('kh.ormas->kh.sound_truck'))
})

test('CA pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const caEntities = countryEntities.filter((row) => row.country_code.trim() === 'CA')
  const tiers = new Set(caEntities.map((row) => row.tier.trim()))

  assert.ok(caEntities.length >= 18)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const caRelationships = relationships.filter((row) => row.country_code.trim() === 'CA')
  assert.ok(caRelationships.length >= 20)

  const entityIds = new Set(caEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('ca.nick'))
  assert.ok(entityIds.has('ca.cpp'))
  assert.ok(entityIds.has('ca.workers'))
  assert.ok(entityIds.has('ca.terry_dianne'))
  assert.ok(entityIds.has('in'))

  const edgeKeys = new Set(
    caRelationships.map((row) => `${row.from_entity_id.trim()}->${row.to_entity_id.trim()}`),
  )
  assert.ok(edgeKeys.has('ca.nick->ca.cpp'))
  assert.ok(edgeKeys.has('ca.cpp->ca.terry_dianne'))
  assert.ok(edgeKeys.has('ca.terry_dianne->ca.florida'))
  assert.ok(edgeKeys.has('ca.ircc->ca.workers'))
  assert.ok(edgeKeys.has('ca.wise->in'))
})

test('CL pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const clEntities = countryEntities.filter((row) => row.country_code.trim() === 'CL')
  const tiers = new Set(clEntities.map((row) => row.tier.trim()))

  assert.ok(clEntities.length >= 14)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const clRelationships = relationships.filter((row) => row.country_code.trim() === 'CL')
  assert.ok(clRelationships.length >= 16)

  const entityIds = new Set(clEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('cl.seba'))
  assert.ok(entityIds.has('cl.fonasa'))
  assert.ok(entityIds.has('cl.afp'))
  assert.ok(entityIds.has('cl.easter_island'))
  assert.ok(entityIds.has('cl.miami'))

  const edgeKeys = new Set(
    clRelationships.map((row) => `${row.from_entity_id.trim()}->${row.to_entity_id.trim()}`),
  )
  assert.ok(edgeKeys.has('cl.seba->cl.migraciones'))
  assert.ok(edgeKeys.has('cl.migraciones->cl.dieudonne_yonaiker'))
  assert.ok(edgeKeys.has('cl.fonasa->cl.easter_island'))
  assert.ok(edgeKeys.has('cl.byron_jennifer->cl.tusi'))
  assert.ok(edgeKeys.has('cl.francisco_anita->cl.miami'))
})

test('CN pilot has tiered entities and relationships', () => {
  const countryEntities = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'country_entities.csv'), 'utf8')),
  )
  const cnEntities = countryEntities.filter((row) => row.country_code.trim() === 'CN')
  const tiers = new Set(cnEntities.map((row) => row.tier.trim()))

  assert.ok(cnEntities.length >= 8)
  assert.ok(tiers.has('1'))
  assert.ok(tiers.has('2'))
  assert.ok(tiers.has('3'))

  const relationships = rowsToObjects(
    parseCsv(fs.readFileSync(path.join(dataDir, 'entity_relationships.csv'), 'utf8')),
  )
  const cnRelationships = relationships.filter((row) => row.country_code.trim() === 'CN')
  assert.ok(cnRelationships.length >= 7)

  const entityIds = new Set(cnEntities.map((row) => row.entity_id.trim()))
  assert.ok(entityIds.has('cn.zhang_weiyi'))
  assert.ok(entityIds.has('cn.china_aid'))
  assert.ok(entityIds.has('cn.ssf'))
  assert.ok(entityIds.has('cn.ababekri'))
  assert.ok(entityIds.has('cn.mahjong'))

  const edgeKeys = new Set(
    cnRelationships.map((row) => `${row.from_entity_id.trim()}->${row.to_entity_id.trim()}`),
  )
  assert.ok(edgeKeys.has('cn.zhang_weiyi->cn.ministry_finance'))
  assert.ok(edgeKeys.has('cn.china_aid->cn.eddy'))
  assert.ok(edgeKeys.has('cn.ministry_finance->cn.gyaltsen'))
  assert.ok(edgeKeys.has('cn.ssf->cn.su_gu'))
  assert.ok(edgeKeys.has('cn.su_gu->cn.mahjong'))
})
