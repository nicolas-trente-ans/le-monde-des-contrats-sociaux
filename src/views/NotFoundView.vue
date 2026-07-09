<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
</script>

<template>
  <section class="not-found">
    <h1>{{ t('notfound.title') }}</h1>
    <p>{{ t('notfound.body') }}</p>
    <RouterLink to="/">{{ t('notfound.back') }}</RouterLink>
  </section>
</template>

<style scoped>
.not-found h1 {
  margin-top: 0;
}

.not-found a {
  color: #175cd3;
}
</style>
