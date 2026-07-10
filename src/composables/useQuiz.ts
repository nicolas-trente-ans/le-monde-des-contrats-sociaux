import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import { assetUrl, parseCsv, rowsToObjects } from '@/utils/csv'

export interface QuizQuestion {
  id: string
  answers: string[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'q01', answers: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'q02', answers: ['a', 'b', 'c', 'd'] },
  { id: 'q03', answers: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'q04', answers: ['a', 'b', 'c', 'd', 'e', 'f'] },
  { id: 'q05', answers: ['a', 'b', 'c', 'd', 'e', 'f'] },
  { id: 'q06', answers: ['a', 'b', 'c', 'd'] },
  { id: 'q07', answers: ['a', 'b', 'c', 'd', 'e', 'f'] },
  { id: 'q08', answers: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'q09', answers: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'q10', answers: ['a', 'b', 'c', 'd'] },
  { id: 'q11', answers: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'q12', answers: ['a', 'b', 'c', 'd'] },
  { id: 'q13', answers: ['a', 'b', 'c', 'd'] },
  { id: 'q14', answers: ['a', 'b', 'c'] },
  { id: 'q15', answers: ['a', 'b'] },
]

export type QuizSelections = Record<string, string>

export interface QuizResult {
  countryCode: string
  totalScore: number
}

interface QuizContext {
  scores: Ref<Map<string, Map<string, number>>>
  ready: Ref<boolean>
  error: Ref<string | null>
  computeResult: (selections: QuizSelections, countryOrder: string[]) => QuizResult | null
}

const quizKey: InjectionKey<QuizContext> = Symbol('quiz')

function scoreKey(questionId: string, answerId: string): string {
  return `${questionId}:${answerId}`
}

function clampScore(value: number): number {
  return Math.max(-5, Math.min(5, value))
}

async function loadQuizScores(): Promise<Map<string, Map<string, number>>> {
  const response = await fetch(assetUrl('data/quiz_scores.csv'))
  if (!response.ok) {
    throw new Error(`Failed to load quiz scores CSV (${response.status})`)
  }

  const rows = parseCsv(await response.text())
  const records = rowsToObjects<'question_id' | 'answer_id' | 'country_code' | 'score'>(rows)

  const map = new Map<string, Map<string, number>>()
  for (const row of records) {
    const key = scoreKey(row.question_id.trim(), row.answer_id.trim())
    const countryCode = row.country_code.trim().toUpperCase()
    const score = clampScore(Number.parseInt(row.score.trim(), 10))
    if (!countryCode || Number.isNaN(score)) continue

    const countryScores = map.get(key) ?? new Map<string, number>()
    countryScores.set(countryCode, score)
    map.set(key, countryScores)
  }

  return map
}

export function provideQuiz(): QuizContext {
  const scores = ref<Map<string, Map<string, number>>>(new Map())
  const ready = ref(false)
  const error = ref<string | null>(null)

  loadQuizScores()
    .then((data) => {
      scores.value = data
      ready.value = true
    })
    .catch((err: unknown) => {
      error.value = err instanceof Error ? err.message : 'Failed to load quiz scores'
    })

  const computeResult = (selections: QuizSelections, countryOrder: string[]): QuizResult | null => {
    const totals = new Map<string, number>()

    for (const question of QUIZ_QUESTIONS) {
      const answerId = selections[question.id]
      if (!answerId) continue

      const answerScores = scores.value.get(scoreKey(question.id, answerId))
      if (!answerScores) continue

      answerScores.forEach((score, countryCode) => {
        totals.set(countryCode, (totals.get(countryCode) ?? 0) + score)
      })
    }

    if (totals.size === 0) return null

    const orderIndex = new Map(countryOrder.map((code, index) => [code, index]))
    let winner = ''
    let highest = Number.NEGATIVE_INFINITY

    for (const [countryCode, total] of totals) {
      if (total > highest) {
        highest = total
        winner = countryCode
      } else if (total === highest) {
        const winnerIndex = orderIndex.get(winner) ?? Number.MAX_SAFE_INTEGER
        const challengerIndex = orderIndex.get(countryCode) ?? Number.MAX_SAFE_INTEGER
        if (challengerIndex < winnerIndex) {
          winner = countryCode
        }
      }
    }

    return { countryCode: winner, totalScore: highest }
  }

  const context: QuizContext = { scores, ready, error, computeResult }
  provide(quizKey, context)
  return context
}

export function useQuiz(): QuizContext {
  const context = inject(quizKey)
  if (!context) {
    throw new Error('useQuiz must be used after provideQuiz')
  }
  return context
}

export function quizQuestionKey(questionId: string): string {
  return `quiz.${questionId}.question`
}

export function quizAnswerKey(questionId: string, answerId: string): string {
  return `quiz.${questionId}.${answerId}`
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }, template)
}
