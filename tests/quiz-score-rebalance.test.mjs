import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  applyCountryProfiles,
  clampScore,
  computePathWinner,
  parseCountryProfiles,
  parseCsv,
  PRESERVED_COUNTRIES,
  rebalanceQuizScores,
  validateScoreBounds,
} from '../scripts/lib/quiz-score-rebalance.mjs'

/** Profiled countries should land within this many points of the path leader. */
const MAX_GAP_FROM_WINNER = 2

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '../public/assets/data')

const quizScoresCsv = fs.readFileSync(path.join(dataDir, 'quiz_scores.csv'), 'utf8')
const profilesCsv = fs.readFileSync(path.join(dataDir, 'quiz_score_profiles.csv'), 'utf8')

const favorablePaths = {
  FR: [
    'q01,a',
    'q02,a',
    'q03,a',
    'q04,b',
    'q05,c',
    'q06,c',
    'q07,d',
    'q08,d',
    'q09,e',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  CN: [
    'q01,a',
    'q02,a',
    'q03,a',
    'q04,f',
    'q05,d',
    'q06,b',
    'q07,c',
    'q08,c',
    'q09,c',
    'q10,c',
    'q11,d',
    'q12,a',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  GB: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,b',
    'q05,b',
    'q06,c',
    'q07,d',
    'q08,c',
    'q09,e',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  DE: [
    'q01,a',
    'q02,a',
    'q03,c',
    'q04,d',
    'q05,b',
    'q06,b',
    'q07,d',
    'q08,b',
    'q09,c',
    'q10,d',
    'q11,d',
    'q12,a',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  NL: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,b',
    'q05,b',
    'q06,d',
    'q07,d',
    'q08,c',
    'q09,e',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  CA: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,b',
    'q05,a',
    'q06,c',
    'q07,d',
    'q08,d',
    'q09,c',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  US: [
    'q01,b',
    'q02,a',
    'q03,b',
    'q04,e',
    'q05,a',
    'q06,b',
    'q07,a',
    'q08,a',
    'q09,e',
    'q10,b',
    'q11,b',
    'q12,b',
    'q13,d',
    'q14,b',
    'q15,a',
  ],
  IT: [
    'q01,a',
    'q02,a',
    'q03,a',
    'q04,b',
    'q05,b',
    'q06,c',
    'q07,d',
    'q08,c',
    'q09,c',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,a',
    'q14,b',
    'q15,a',
  ],
  LI: [
    'q01,c',
    'q02,a',
    'q03,e',
    'q04,f',
    'q05,f',
    'q06,a',
    'q07,f',
    'q08,e',
    'q09,e',
    'q10,d',
    'q11,e',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,b',
  ],
  ES: [
    'q01,a',
    'q02,a',
    'q03,a',
    'q04,b',
    'q05,e',
    'q06,c',
    'q07,d',
    'q08,c',
    'q09,c',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,b',
    'q15,a',
  ],
  BR: [
    'q01,a',
    'q02,a',
    'q03,d',
    'q04,a',
    'q05,e',
    'q06,d',
    'q07,e',
    'q08,c',
    'q09,c',
    'q10,b',
    'q11,b',
    'q12,c',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  IN: [
    'q01,c',
    'q02,a',
    'q03,b',
    'q04,d',
    'q05,d',
    'q06,b',
    'q07,c',
    'q08,c',
    'q09,c',
    'q10,c',
    'q11,d',
    'q12,a',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  ID: [
    'q01,d',
    'q02,b',
    'q03,c',
    'q04,c',
    'q05,d',
    'q06,d',
    'q07,d',
    'q08,b',
    'q09,e',
    'q10,c',
    'q11,c',
    'q12,b',
    'q13,a',
    'q14,a',
    'q15,a',
  ],
  IL: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,e',
    'q05,d',
    'q06,a',
    'q07,a',
    'q08,c',
    'q09,b',
    'q10,b',
    'q11,a',
    'q12,c',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  MY: [
    'q01,b',
    'q02,a',
    'q03,b',
    'q04,c',
    'q05,d',
    'q06,b',
    'q07,b',
    'q08,c',
    'q09,c',
    'q10,c',
    'q11,b',
    'q12,d',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  NG: [
    'q01,a',
    'q02,a',
    'q03,d',
    'q04,a',
    'q05,c',
    'q06,b',
    'q07,d',
    'q08,c',
    'q09,e',
    'q10,c',
    'q11,b',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  PT: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,b',
    'q05,c',
    'q06,c',
    'q07,d',
    'q08,c',
    'q09,c',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,b',
    'q15,a',
  ],
  RU: [
    'q01,a',
    'q02,a',
    'q03,a',
    'q04,a',
    'q04,e',
    'q05,f',
    'q06,c',
    'q07,b',
    'q08,b',
    'q09,a',
    'q10,d',
    'q11,a',
    'q12,a',
    'q13,b',
    'q15,b',
  ],
  ZA: [
    'q01,a',
    'q02,a',
    'q03,d',
    'q04,e',
    'q05,c',
    'q06,b',
    'q07,d',
    'q08,c',
    'q09,e',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,b',
    'q15,a',
  ],
  TR: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,e',
    'q05,d',
    'q06,b',
    'q07,d',
    'q08,c',
    'q09,c',
    'q10,d',
    'q11,c',
    'q12,c',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  AO: [
    'q01,a',
    'q02,a',
    'q03,d',
    'q04,a',
    'q05,c',
    'q06,b',
    'q07,d',
    'q08,c',
    'q09,e',
    'q10,c',
    'q11,b',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  AR: [
    'q01,a',
    'q02,a',
    'q03,d',
    'q04,e',
    'q05,e',
    'q06,d',
    'q07,e',
    'q08,c',
    'q09,c',
    'q10,b',
    'q11,b',
    'q12,c',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  AU: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,b',
    'q05,f',
    'q06,c',
    'q07,d',
    'q08,c',
    'q09,c',
    'q10,c',
    'q11,c',
    'q12,d',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  AT: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,d',
    'q05,b',
    'q06,b',
    'q07,d',
    'q08,b',
    'q09,c',
    'q10,d',
    'q11,e',
    'q12,a',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  BG: [
    'q01,a',
    'q02,a',
    'q03,a',
    'q04,a',
    'q05,b',
    'q06,c',
    'q07,b',
    'q08,b',
    'q09,c',
    'q10,d',
    'q11,b',
    'q12,a',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  KH: [
    'q01,d',
    'q02,b',
    'q03,c',
    'q04,c',
    'q05,d',
    'q06,d',
    'q07,d',
    'q08,b',
    'q09,e',
    'q10,c',
    'q11,b',
    'q12,b',
    'q13,a',
    'q14,a',
    'q15,a',
  ],
  CL: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,e',
    'q05,e',
    'q06,d',
    'q07,e',
    'q08,c',
    'q09,c',
    'q10,b',
    'q11,b',
    'q12,c',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  CO: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,a',
    'q05,e',
    'q06,d',
    'q07,d',
    'q08,c',
    'q09,e',
    'q10,b',
    'q11,b',
    'q12,c',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
  CZ: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,d',
    'q05,b',
    'q06,b',
    'q07,d',
    'q08,b',
    'q09,c',
    'q10,d',
    'q11,d',
    'q12,a',
    'q13,c',
    'q14,c',
    'q15,a',
  ],
  DK: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,b',
    'q05,b',
    'q06,d',
    'q07,d',
    'q08,c',
    'q09,e',
    'q10,c',
    'q11,e',
    'q12,d',
    'q13,d',
    'q14,c',
    'q15,a',
  ],
  DO: [
    'q01,a',
    'q02,a',
    'q03,b',
    'q04,e',
    'q05,a',
    'q06,b',
    'q07,e',
    'q08,c',
    'q09,c',
    'q10,b',
    'q11,b',
    'q12,c',
    'q13,b',
    'q14,b',
    'q15,a',
  ],
}

test('clampScore keeps values within -5..5', () => {
  assert.equal(clampScore(-10), -5)
  assert.equal(clampScore(10), 5)
  assert.equal(clampScore(3), 3)
})

test('parseCsv handles quoted fields', () => {
  const rows = parseCsv('a,b\n"hello, world",2\n')
  assert.deepEqual(rows, [
    ['a', 'b'],
    ['hello, world', '2'],
  ])
})

test('parseCountryProfiles reads baselines and deltas', () => {
  const csv = `country_code,baseline,question_id,answer_id,delta
GB,FR,q01,a,1
GB,FR,q04,b,-2
NL,GB,q03,b,2
`
  const { profiles, order } = parseCountryProfiles(csv)

  assert.deepEqual(order, ['GB', 'NL'])
  assert.equal(profiles.GB.baseline, 'FR')
  assert.equal(profiles.GB.deltas['q01,a'], 1)
  assert.equal(profiles.GB.deltas['q04,b'], -2)
  assert.equal(profiles.NL.baseline, 'GB')
  assert.equal(profiles.NL.deltas['q03,b'], 2)
})

test('parseCountryProfiles rejects conflicting baselines', () => {
  const csv = `country_code,baseline,question_id,answer_id,delta
GB,FR,q01,a,1
GB,CN,q02,a,1
`
  assert.throws(() => parseCountryProfiles(csv), /Conflicting baseline for GB/)
})

test('applyCountryProfiles uses chained baselines in order', () => {
  const scores = new Map([
    ['q01,a', new Map([['FR', 2]])],
    ['q03,b', new Map([['FR', 2]])],
  ])

  const profiles = {
    GB: { baseline: 'FR', deltas: { 'q01,a': 1 } },
    NL: { baseline: 'GB', deltas: { 'q03,b': 2 } },
  }

  applyCountryProfiles(scores, profiles, ['GB', 'NL'])

  assert.equal(scores.get('q01,a').get('GB'), 3)
  assert.equal(scores.get('q03,b').get('NL'), 4)
})

test('applyCountryProfiles treats missing deltas as zero', () => {
  const scores = new Map([['q01,a', new Map([['FR', 2]])]])
  const profiles = {
    GB: { baseline: 'FR', deltas: {} },
  }

  applyCountryProfiles(scores, profiles, ['GB'])
  assert.equal(scores.get('q01,a').get('GB'), 2)
})

test('rebalanceQuizScores returns csv without mutating input strings', () => {
  const quizCsv = `question_id,answer_id,country_code,score
q01,a,FR,4
q01,a,CN,3
`
  const profileCsv = `country_code,baseline,question_id,answer_id,delta
GB,FR,q01,a,1
`

  const before = quizCsv
  const { csvContent, scores } = rebalanceQuizScores(quizCsv, profileCsv)

  assert.equal(quizCsv, before)
  assert.match(csvContent, /q01,a,GB,5/)
  assert.equal(scores.get('q01,a').get('GB'), 5)
})

test('validateScoreBounds rejects out-of-range scores', () => {
  const scores = new Map([['q01,a', new Map([['FR', 6]])]])
  assert.throws(() => validateScoreBounds(scores), /out of bounds/)
})

test('preserved countries win their favorable answer path', () => {
  const { scores, countries } = rebalanceQuizScores(quizScoresCsv, profilesCsv)

  for (const country of PRESERVED_COUNTRIES) {
    const pathKeys = favorablePaths[country]
    const { winner } = computePathWinner(scores, pathKeys, countries)
    assert.equal(winner, country, `${country} should win its favorable path, got ${winner}`)
  }
})

test('each country stays competitive on its favorable path', () => {
  const { scores, countries } = rebalanceQuizScores(quizScoresCsv, profilesCsv)

  for (const [country, pathKeys] of Object.entries(favorablePaths)) {
    const { top, totals } = computePathWinner(scores, pathKeys, countries)
    const own = totals[country]
    const gap = top - own

    assert.ok(
      gap <= MAX_GAP_FROM_WINNER,
      `${country} scores ${own} on its path, leader has ${top} (gap ${gap})`,
    )
  }
})

test('rebalanced scores stay within bounds for every country', () => {
  const { scores } = rebalanceQuizScores(quizScoresCsv, profilesCsv)
  assert.doesNotThrow(() => validateScoreBounds(scores))
})

test('rebalanced csv includes every profiled country', () => {
  const { csvContent, order } = rebalanceQuizScores(quizScoresCsv, profilesCsv)

  for (const country of order) {
    assert.match(csvContent, new RegExp(`,${country},`))
  }
})

test('computePathWinner breaks ties by score sort order', () => {
  const scores = new Map([
    [
      'q01,a',
      new Map([
        ['FR', 5],
        ['GB', 5],
      ]),
    ],
  ])

  const { winner, top } = computePathWinner(scores, ['q01,a'], ['FR', 'GB'])
  assert.equal(winner, 'FR')
  assert.equal(top, 5)
})
