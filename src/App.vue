<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { provideCountries } from '@/composables/useCountries'
import { provideLocalization } from '@/composables/useLocalization'

provideLocalization()
provideCountries()
</script>

<template>
  <div class="app">
    <NavBar />
    <main class="main">
      <router-view />
    </main>
  </div>
</template>
