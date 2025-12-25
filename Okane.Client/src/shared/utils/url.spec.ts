// Internal
import * as utils from '@shared/utils/url'

describe('getQueryParamArray', () => {
  test('returns an empty array for missing key', () => {
    expect(utils.getQueryParamArray('a', {})).toEqual([])
  })

  test('returns an empty array for falsy values', () => {
    expect(utils.getQueryParamArray('a', { a: '' })).toEqual([])
    expect(utils.getQueryParamArray('a', { a: null })).toEqual([])
  })

  test('returns an array when the value is not an array', () => {
    expect(utils.getQueryParamArray('a', { a: 'a' })).toEqual(['a'])
  })

  test('returns an array of values', () => {
    expect(utils.getQueryParamArray('a', { a: ['a', 'b'] })).toEqual(['a', 'b'])
  })
})

describe('getQueryParamValue', () => {
  test('returns an empty string when key does not exist', () => {
    expect(utils.getQueryParamValue('a', { b: 'a' })).toEqual('')
  })

  test('returns an empty string when value is falsy', () => {
    expect(utils.getQueryParamValue('a', { a: '' })).toEqual('')
    expect(utils.getQueryParamValue('a', { a: null })).toEqual('')
  })

  test('returns the value associated with the key', () => {
    expect(utils.getQueryParamValue('a', { a: 'a', b: 'b' })).toEqual('a')
  })
})

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
