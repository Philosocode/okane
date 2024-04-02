// Internal
import { CustomMatchers } from '@tests/setup/matchers.setup'

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
