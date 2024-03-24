// External
import type { Assertion, AsymmetricMatchersContaining } from 'vitest'

// Internal
import { CustomMatchers } from 'src/__tests__/config/setUpCustomMatchers'

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
