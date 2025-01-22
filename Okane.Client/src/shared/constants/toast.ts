// Internal
import { HTML_ROLE } from '@shared/constants/html'

export const TOAST_HIDE_AFTER_MS = 5000

export const SUCCESS_TOAST_ATTRIBUTES = {
  // "status' includes "aria-live" https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22.
  role: HTML_ROLE.STATUS,
  'aria-atomic': 'true',
} as const

export const ERROR_TOAST_ATTRIBUTES = {
  role: HTML_ROLE.ALERT,
  'aria-atomic': 'true',
  'aria-live': 'assertive',
} as const
