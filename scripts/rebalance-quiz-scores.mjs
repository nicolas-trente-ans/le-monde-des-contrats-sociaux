/**
 * Rebalance quiz scores for countries added after FR/CN.
 *
 * Usage: node scripts/rebalance-quiz-scores.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rebalanceQuizScores } from './lib/quiz-score-rebalance.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const csvPath = path.join(__dirname, '../public/assets/data/quiz_scores.csv')
const profilesPath = path.join(__dirname, '../public/assets/data/quiz_score_profiles.csv')

const quizScoresCsv = fs.readFileSync(csvPath, 'utf8')
const profilesCsv = fs.readFileSync(profilesPath, 'utf8')
const { csvContent } = rebalanceQuizScores(quizScoresCsv, profilesCsv)

fs.writeFileSync(csvPath, csvContent)
console.log('Rebalanced quiz scores written to', csvPath)
