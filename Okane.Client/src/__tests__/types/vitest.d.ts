// Internal
import { CustomMatchers } from '@tests/setup/customMatchers'

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
