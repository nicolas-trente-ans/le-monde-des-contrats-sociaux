export const PRESERVED_COUNTRIES = ['FR', 'CN']

export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') inQuotes = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      if (char === '\r') i += 1
    } else if (char !== '\r') field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0))
}

export function clampScore(value) {
  return Math.max(-5, Math.min(5, value))
}

/** @returns {Record<string, { baseline: string, deltas: Record<string, number> }>} */
export function parseCountryProfiles(csvText) {
  const rows = parseCsv(csvText)
  const [header, ...dataRows] = rows
  const columnIndex = Object.fromEntries(header.map((name, index) => [name, index]))

  /** @type {Record<string, { baseline: string, deltas: Record<string, number> }>} */
  const profiles = {}
  /** @type {string[]} */
  const order = []

  for (const cells of dataRows) {
    const countryCode = cells[columnIndex.country_code]?.trim().toUpperCase()
    const baseline = cells[columnIndex.baseline]?.trim().toUpperCase()
    const questionId = cells[columnIndex.question_id]?.trim()
    const answerId = cells[columnIndex.answer_id]?.trim()
    const delta = Number.parseInt(cells[columnIndex.delta]?.trim() ?? '', 10)

    if (!countryCode || !baseline || !questionId || !answerId || Number.isNaN(delta)) {
      throw new Error(`Invalid profile row: ${cells.join(',')}`)
    }

    if (!profiles[countryCode]) {
      profiles[countryCode] = { baseline, deltas: {} }
      order.push(countryCode)
    }

    if (profiles[countryCode].baseline !== baseline) {
      throw new Error(
        `Conflicting baseline for ${countryCode}: ${profiles[countryCode].baseline} vs ${baseline}`,
      )
    }

    profiles[countryCode].deltas[`${questionId},${answerId}`] = delta
  }

  return { profiles, order }
}

/**
 * @returns {{
 *   header: string[],
 *   scores: Map<string, Map<string, number>>,
 *   answerKeys: string[],
 * }}
 */
export function parseQuizScores(csvText) {
  const rows = parseCsv(csvText)
  const header = rows[0]
  const dataRows = rows.slice(1)

  /** @type {Map<string, Map<string, number>>} */
  const scores = new Map()

  for (const cells of dataRows) {
    const [question_id, answer_id, country_code, scoreRaw] = cells
    const key = `${question_id},${answer_id}`
    const country = country_code.trim().toUpperCase()
    if (!scores.has(key)) scores.set(key, new Map())
    scores.get(key).set(country, Number(scoreRaw))
  }

  const answerKeys = [...scores.keys()].sort((a, b) => a.localeCompare(b))
  return { header, scores, answerKeys }
}

/**
 * @param {Map<string, Map<string, number>>} scores
 * @param {Record<string, { baseline: string, deltas: Record<string, number> }>} countryProfiles
 * @param {string[]} rebalanceOrder
 */
export function applyCountryProfiles(scores, countryProfiles, rebalanceOrder) {
  for (const country of rebalanceOrder) {
    const profile = countryProfiles[country]
    if (!profile) {
      throw new Error(`Missing profile for ${country}`)
    }

    const { baseline, deltas } = profile

    for (const [key, countryScores] of scores) {
      const baseScore = countryScores.get(baseline)
      if (baseScore === undefined) {
        throw new Error(`Missing baseline ${baseline} for ${key}`)
      }

      const delta = deltas[key] ?? 0
      countryScores.set(country, clampScore(baseScore + delta))
    }
  }
}

export function getQuizCountries(rebalanceOrder) {
  return [...PRESERVED_COUNTRIES, ...rebalanceOrder]
}

/**
 * @param {string[]} header
 * @param {Map<string, Map<string, number>>} scores
 * @param {string[]} countries
 * @param {string[]} answerKeys
 */
export function formatQuizScoresCsv(header, scores, countries, answerKeys) {
  const output = [header.join(',')]

  for (const country of countries) {
    for (const key of answerKeys) {
      const [question_id, answer_id] = key.split(',')
      const score = scores.get(key)?.get(country)
      if (score === undefined) {
        throw new Error(`Missing score for ${country} on ${key}`)
      }
      output.push(`${question_id},${answer_id},${country},${score}`)
    }
  }

  return `${output.join('\n')}\n`
}

/**
 * @param {Map<string, Map<string, number>>} scores
 * @param {string[]} pathKeys
 * @param {string[]} countries
 */
export function computePathWinner(scores, pathKeys, countries) {
  const totals = Object.fromEntries(countries.map((country) => [country, 0]))

  for (const key of pathKeys) {
    const answerScores = scores.get(key)
    if (!answerScores) {
      throw new Error(`Unknown answer key: ${key}`)
    }

    for (const country of countries) {
      const score = answerScores.get(country)
      if (score === undefined) {
        throw new Error(`Missing score for ${country} on ${key}`)
      }
      totals[country] += score
    }
  }

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
  return { totals, winner: sorted[0][0], top: sorted[0][1], sorted }
}

/** @param {Map<string, Map<string, number>>} scores */
export function validateScoreBounds(scores) {
  for (const [key, countryScores] of scores) {
    for (const [country, score] of countryScores) {
      if (score < -5 || score > 5) {
        throw new Error(`Score out of bounds for ${country} on ${key}: ${score}`)
      }
    }
  }
}

/**
 * @param {string} quizScoresCsv
 * @param {string} profilesCsv
 */
export function rebalanceQuizScores(quizScoresCsv, profilesCsv) {
  const { profiles, order } = parseCountryProfiles(profilesCsv)
  const { header, scores, answerKeys } = parseQuizScores(quizScoresCsv)

  applyCountryProfiles(scores, profiles, order)
  validateScoreBounds(scores)

  const countries = getQuizCountries(order)
  const csvContent = formatQuizScoresCsv(header, scores, countries, answerKeys)

  return { csvContent, scores, countries, answerKeys, profiles, order }
}
