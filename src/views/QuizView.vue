<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { countryLabelKey, useCountries } from '@/composables/useCountries'
import { useLocalization } from '@/composables/useLocalization'
import { useMemePreview } from '@/composables/useMemePreview'
import {
  QUIZ_QUESTIONS,
  interpolate,
  quizAnswerKey,
  quizQuestionKey,
  useQuiz,
  type QuizResult,
  type QuizSelections,
} from '@/composables/useQuiz'
import { countryRoutePath } from '@/utils/csv'

const router = useRouter()
const { t } = useLocalization()
const { countries, ready: countriesReady, getCountry } = useCountries()
const { openPreview } = useMemePreview()
const { ready: quizReady, error, computeResult } = useQuiz()

const currentIndex = ref(0)
const selections = ref<QuizSelections>({})
const result = ref<QuizResult | null>(null)

const ready = computed(() => countriesReady.value && quizReady.value)
const currentQuestion = computed(() => QUIZ_QUESTIONS[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === QUIZ_QUESTIONS.length - 1)
const showingResult = computed(() => result.value !== null)

const countryOrder = computed(() => Array.from(countries.value.keys()))

const currentSelection = computed({
  get: () => {
    const question = currentQuestion.value
    return question ? selections.value[question.id] : undefined
  },
  set: (answerId: string | undefined) => {
    const question = currentQuestion.value
    if (!question || !answerId) return
    selections.value = { ...selections.value, [question.id]: answerId }
  },
})

const progressLabel = computed(() =>
  interpolate(t('quiz.progress'), {
    current: currentIndex.value + 1,
    total: QUIZ_QUESTIONS.length,
  }),
)

const resultCountryLabel = computed(() => {
  if (!result.value) return ''
  return t(countryLabelKey(result.value.countryCode))
})

const resultLead = computed(() => {
  if (!result.value) return ''
  return interpolate(t('quiz.result.lead'), { country: resultCountryLabel.value })
})

const resultScore = computed(() => {
  if (!result.value) return ''
  return interpolate(t('quiz.result.score'), { score: result.value.totalScore })
})

function nextStep() {
  if (!currentSelection.value || !currentQuestion.value) return

  if (isLastQuestion.value) {
    const outcome = computeResult(selections.value, countryOrder.value)
    if (outcome) {
      result.value = outcome
    }
    return
  }

  currentIndex.value += 1
}

function goToCountryPage() {
  if (!result.value) return
  router.push(countryRoutePath(result.value.countryCode))
}

watch(result, (outcome) => {
  if (!outcome) return
  const country = getCountry(outcome.countryCode)
  if (country) {
    openPreview(country)
  }
})
</script>

<template>
  <section class="quiz">
    <header class="quiz__header">
      <h1>{{ t('quiz.title') }}</h1>
      <p class="quiz__subtitle">{{ t('quiz.subtitle') }}</p>
    </header>

    <p v-if="error" class="quiz__error">{{ error }}</p>
    <p v-else-if="!ready" class="quiz__loading">{{ t('quiz.loading') }}</p>

    <article v-else-if="showingResult && result" class="quiz__result">
      <h2>{{ t('quiz.result.title') }}</h2>
      <p class="quiz__result-lead">{{ resultLead }}</p>
      <p class="quiz__result-score">{{ resultScore }}</p>
      <img
        v-if="getCountry(result.countryCode)"
        class="quiz__result-image"
        :src="getCountry(result.countryCode)!.imageUrl"
        :alt="resultCountryLabel"
        @click="openPreview(getCountry(result.countryCode)!)"
      />
      <button type="button" class="quiz__button" @click="goToCountryPage">
        {{ t('quiz.result.continue') }}
      </button>
    </article>

    <article v-else-if="currentQuestion" class="quiz__question">
      <p class="quiz__progress">{{ progressLabel }}</p>
      <h2>{{ t(quizQuestionKey(currentQuestion.id)) }}</h2>

      <fieldset class="quiz__answers">
        <legend class="quiz__sr-only">{{ t(quizQuestionKey(currentQuestion.id)) }}</legend>
        <label v-for="answerId in currentQuestion.answers" :key="answerId" class="quiz__answer">
          <input v-model="currentSelection" type="radio" :value="answerId" />
          <span>{{ t(quizAnswerKey(currentQuestion.id, answerId)) }}</span>
        </label>
      </fieldset>

      <button type="button" class="quiz__button" :disabled="!currentSelection" @click="nextStep">
        {{ isLastQuestion ? t('quiz.finish') : t('quiz.next') }}
      </button>
    </article>
  </section>
</template>

<style scoped>
.quiz__header {
  margin-bottom: 1.5rem;
}

.quiz__header h1 {
  margin: 0 0 0.35rem;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

.quiz__subtitle {
  margin: 0;
  color: #475467;
}

.quiz__progress {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #667085;
}

.quiz__question h2,
.quiz__result h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.quiz__answers {
  margin: 0 0 1.25rem;
  padding: 0;
  border: 0;
  display: grid;
  gap: 0.65rem;
}

.quiz__answer {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #dbe2ef;
  border-radius: 8px;
  cursor: pointer;
}

.quiz__answer:has(input:checked) {
  border-color: #175cd3;
  background: #eff4ff;
}

.quiz__answer input {
  margin-top: 0.2rem;
}

.quiz__button {
  padding: 0.65rem 1.25rem;
  border: 0;
  border-radius: 8px;
  background: #175cd3;
  color: #fff;
  font-weight: 600;
}

.quiz__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quiz__result-lead {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.quiz__result-score {
  margin: 0 0 1.25rem;
  color: #475467;
}

.quiz__result-image {
  display: block;
  width: min(480px, 100%);
  height: auto;
  margin: 0 0 1.25rem;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(16 24 40 / 12%);
  cursor: pointer;
}

.quiz__loading,
.quiz__error {
  margin: 0;
}

.quiz__error {
  color: #b42318;
}

.quiz__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
