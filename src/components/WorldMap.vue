<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import svgMap from 'svgmap'
import 'svgmap/style'
import { countryLabelKey, useCountries, type CountryMeme } from '@/composables/useCountries'
import { useLocalization } from '@/composables/useLocalization'

const emit = defineEmits<{
  select: [country: CountryMeme]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapElementId = `world-map-${Math.random().toString(36).slice(2)}`
let mapInstance: svgMap | null = null

const { countries, ready, error, getCountry } = useCountries()
const { locale, t } = useLocalization()

function clearMapTooltip() {
  mapInstance?.hideTooltip()
  mapContainer.value
    ?.querySelectorAll('.svgMap-country.svgMap-active')
    .forEach((element) => element.classList.remove('svgMap-active'))
}

function destroyMap() {
  clearMapTooltip()
  if (mapContainer.value) {
    mapContainer.value.innerHTML = ''
  }
  mapInstance = null
}

function buildMapValues() {
  const values: Record<string, Record<string, number>> = {}
  countries.value.forEach((country) => {
    values[country.countryCode] = { hasMeme: 1 }
  })
  return values
}

function buildTooltipContent(countryID: string): HTMLElement {
  const container = document.createElement('div')
  container.className = 'map-tooltip'

  const country = getCountry(countryID)
  if (!country) {
    const message = document.createElement('p')
    message.textContent = t('map.no_meme')
    container.appendChild(message)
    return container
  }

  const label = t(countryLabelKey(country.countryCode))

  const title = document.createElement('strong')
  title.textContent = label
  container.appendChild(title)

  const image = document.createElement('img')
  image.src = country.imageUrl
  image.alt = label
  image.width = 120
  container.appendChild(image)

  const hint = document.createElement('p')
  hint.className = 'map-tooltip-hint'
  hint.textContent = t('map.click_hint')
  container.appendChild(hint)

  return container
}

function initMap() {
  if (!mapContainer.value || countries.value.size === 0) return

  destroyMap()
  mapContainer.value.id = mapElementId

  mapInstance = new svgMap({
    targetElementID: mapElementId,
    allowInteraction: true,
    colorMin: '#7c9cbf',
    colorMax: '#2d5986',
    colorNoData: '#e8edf3',
    showTooltips: true,
    tooltipTrigger: 'hover',
    data: {
      data: {
        hasMeme: {
          name: 'Has meme',
          format: '{0}',
          thresholdMin: 0,
          thresholdMax: 1,
        },
      },
      applyData: 'hasMeme',
      values: buildMapValues(),
    },
    onGetTooltip(_tooltipDiv, countryID) {
      return buildTooltipContent(countryID)
    },
    onCountryClick(countryID) {
      clearMapTooltip()
      const country = getCountry(countryID)
      if (country) {
        emit('select', country)
      }
      return false
    },
  })
}

watch([ready, countries], ([isReady]) => {
  if (isReady) initMap()
})

watch(locale, () => {
  if (ready.value) initMap()
})

onMounted(() => {
  if (ready.value) initMap()
})

onUnmounted(() => {
  destroyMap()
})
</script>

<template>
  <section class="world-map">
    <p v-if="error" class="map-error">{{ error }}</p>
    <p v-else-if="!ready" class="map-loading">Loading map…</p>
    <div ref="mapContainer" class="world-map__canvas" aria-label="Interactive world map" />
  </section>
</template>

<style scoped>
.world-map {
  width: 100%;
}

.world-map__canvas {
  width: 100%;
  min-height: 420px;
}

.map-loading,
.map-error {
  margin: 0 0 1rem;
}

.map-error {
  color: #b42318;
}
</style>

<style>
.map-tooltip {
  display: grid;
  gap: 0.35rem;
  max-width: 160px;
}

.map-tooltip img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.map-tooltip-hint {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.85;
}

.svgMap-map-wrapper .svgMap-country[data-link] {
  cursor: pointer;
}
</style>
