import { SHARED_COPY } from '@shared/constants/copy'

import { type ECBasicOption } from 'echarts/types/dist/shared'

export const BASE_CHART_OPTIONS: ECBasicOption = {
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily:
      "'Avenir Next', Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontWeight: 500,
  },
} as const

export const CHART_LOADING_OPTIONS = {
  text: SHARED_COPY.LOADING_ELLIPSES,
  color: '#0abf85', // Loader color. --color-green-500
  fontFamily: BASE_CHART_OPTIONS.textStyle!.fontFamily,
  fontSize: 20,
  fontWeight: BASE_CHART_OPTIONS.textStyle?.fontWeight!,
  maskColor: 'rgba(0, 0, 0, 50%)',
  showSpinner: true,
  spinnerRadius: 16,
  textColor: '#E7E7E7', // --color-grey-100
}

export const CHART_COLOR_GREEN = '#2fd89c' // --color-green-400
export const CHART_COLOR_RED = '#e11d48' // --color-red-500
