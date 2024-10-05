export const ARIA_ATTRIBUTES = {
  CONTROLS: 'aria-controls',
  DESCRIBED_BY: 'aria-describedby',
  EXPANDED: 'aria-expanded',
  HAS_POPUP: 'aria-haspopup',
  HIDDEN: 'aria-hidden',
  INVALID: 'aria-invalid',
  LABEL: 'aria-label',
  LABELLED_BY: 'aria-labelledby',
  LIVE: 'aria-live',
  MODAL: 'aria-modal',
} as const

export enum ARIA_LIVE {
  ASSERTIVE = 'assertive',
}
