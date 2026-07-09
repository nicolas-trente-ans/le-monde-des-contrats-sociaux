<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
</script>

<template>
  <nav class="navbar">
    <RouterLink class="navbar__brand" to="/">{{ t('site.title') }}</RouterLink>
    <div class="navbar__links">
      <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
      <RouterLink to="/about">{{ t('nav.about') }}</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: #fff;
  border-bottom: 1px solid #dbe2ef;
}

.navbar__brand {
  font-weight: 700;
  text-decoration: none;
}

.navbar__links {
  display: flex;
  gap: 1rem;
}

.navbar__links a {
  text-decoration: none;
  color: #344054;
}

.navbar__links a.router-link-active {
  color: #175cd3;
  font-weight: 600;
}
</style>
