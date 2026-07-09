<script setup lang="ts">
import { useLocalization, type Locale } from '@/composables/useLocalization'

const { locale, setLocale } = useLocalization()

const options: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
]
</script>

<template>
  <label class="language-selector">
    <span class="language-selector__label">Language</span>
    <select
      :value="locale"
      @change="setLocale(($event.target as HTMLSelectElement).value as Locale)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.language-selector {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.language-selector select {
  padding: 0.35rem 0.5rem;
  border: 1px solid #cfd8e7;
  border-radius: 6px;
  background: #fff;
}
</style>
