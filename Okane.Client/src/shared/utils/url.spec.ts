// Internal
import * as utils from '@shared/utils/url'

describe('stripSearchParams', () => {
  test.each([
    { input: '', expected: '' },
    { input: ' ', expected: ' ' },
    { input: 'google.com', expected: 'google.com' },
    { input: 'google.com?a=1&b=2', expected: 'google.com' },
    { input: 'google.com?a=1?b=2', expected: 'google.com' },
  ])('stripSearchParams("$input") -> $expected', ({ input, expected }) => {
    expect(utils.stripSearchParams(input)).toBe(expected)
  })
})
