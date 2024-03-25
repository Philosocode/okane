// Internal
import { isNumeric } from '@/shared/utils/number.utils'

export interface CustomMatchers<T = unknown> {
  toBeNumeric: () => T
}

expect.extend({
  toBeNumeric(received: unknown) {
    const { isNot } = this
    return {
      pass: isNumeric(received),
      message: () => `${received} is ${isNot ? 'not' : ''} a number or numeric string`,
    }
  },
})
