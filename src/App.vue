<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import MemePreview from '@/components/MemePreview.vue'
import { provideCountries } from '@/composables/useCountries'
import { provideLocalization } from '@/composables/useLocalization'
import { provideMemePreview } from '@/composables/useMemePreview'
import { provideQuiz } from '@/composables/useQuiz'
import router from '@/router'

provideLocalization()
provideCountries()
provideQuiz()

const { previewCountry, closePreview } = provideMemePreview()

router.afterEach(() => {
  closePreview()
})
</script>

<template>
  <div class="app">
    <NavBar />
    <main class="main">
      <router-view />
    </main>
    <AppFooter />
    <MemePreview :country="previewCountry" @close="closePreview" />
  </div>
</template>
