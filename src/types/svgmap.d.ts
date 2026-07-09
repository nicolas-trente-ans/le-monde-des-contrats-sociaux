declare class svgMap {
  constructor(options: SvgMapOptions)
  hideTooltip(): void
}

interface SvgMapOptions {
  targetElementID: string
  allowInteraction?: boolean
  colorMax?: string
  colorMin?: string
  colorNoData?: string
  showTooltips?: boolean
  tooltipTrigger?: 'hover' | 'click'
  data?: {
    data: Record<
      string,
      { name: string; format?: string; thresholdMax?: number; thresholdMin?: number }
    >
    applyData: string
    values: Record<string, Record<string, number>>
  }
  onGetTooltip?: (
    tooltipDiv: HTMLElement,
    countryID: string,
    countryValues: Record<string, unknown> | null,
  ) => HTMLElement | null
  onCountryClick?: (countryID: string, event: MouseEvent) => boolean | void
}

declare module 'svgmap' {
  export default svgMap
}

declare module 'svgmap/style'
