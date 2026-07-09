<script setup lang="ts">
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
</script>

<template>
  <section class="about">
    <h1>{{ t('about.title') }}</h1>
    <p>{{ t('about.body') }}</p>
  </section>
</template>

<style scoped>
.about h1 {
  margin-top: 0;
}
</style>
