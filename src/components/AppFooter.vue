<script setup lang="ts">
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()

const contributeUrl = 'https://github.com/nicolas-trente-ans/le-monde-des-contrats-sociaux'
</script>

<template>
  <footer class="app-footer">
    <a class="app-footer__link" :href="contributeUrl" target="_blank" rel="noopener noreferrer">
      {{ t('footer.contribute') }}
    </a>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #dbe2ef;
  background: #fff;
}

.app-footer__link {
  color: #175cd3;
  font-weight: 600;
  text-decoration: none;
}

.app-footer__link:hover {
  text-decoration: underline;
}
</style>
