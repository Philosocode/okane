// Internal
import * as stringUtils from '@shared/utils/string'

describe('capitalize', () => {
  test.each([
    ['abc', 'Abc'],
    ['abc abc', 'Abc abc'],
    ['', ''],
    [' ', ' '],
    [' a', ' a'],
    ['1234', '1234'],
  ])(`capitalize('%s') -> '%s'`, (value, expected) => {
    expect(stringUtils.capitalize(value)).toBe(expected)
  })
})

describe('compareStrings', () => {
  test('returns -1 when s1 < s2', () => {
    expect(stringUtils.compareStrings('a', 'aa')).toBe(-1)
    expect(stringUtils.compareStrings('A', 'a')).toBe(-1)
  })

  test('returns 0 when s1 === s2', () => {
    expect(stringUtils.compareStrings('a', 'a')).toBe(0)
    expect(stringUtils.compareStrings('AA', 'AA')).toBe(0)
  })

  test('returns 1 when s1 > s2', () => {
    expect(stringUtils.compareStrings('aa', 'a')).toBe(1)
    expect(stringUtils.compareStrings('a', 'A')).toBe(1)
  })
})

describe('isAlphabetString', () => {
  test.each([
    ['a', true],
    ['abc', true],
    ['1234', false],
    ['a12c', false],
    ['!@', false],
    ['', false],
    [' ', false],
    [' a', false],
    ['!', false],
  ])(`isAlphabetString('%s') => %s`, (value, expected) => {
    expect(stringUtils.isAlphabetString(value)).toBe(expected)
  })
})

describe('isAlphanumericString', () => {
  test.each([
    ['a', true],
    ['abc', true],
    ['1234', true],
    ['ab12', true],
    ['a12c', true],
    ['', false],
    [' ', false],
    ['!@', false],
    [' a', false],
    ['a12c@', false],
  ])(`isAlphanumericString('%s') => %s`, (value, expected) => {
    expect(stringUtils.isAlphanumericString(value)).toBe(expected)
  })
})

describe('isIntegerString', () => {
  test.each([
    ['1', true],
    ['1234', true],
    [' 1234 ', false],
    ['ab12', false],
    ['', false],
    [' ', false],
    ['!@', false],
    [' a', false],
    ['a12c@', false],
  ])(`isIntegerString('%s') => %s`, (value, expected) => {
    expect(stringUtils.isIntegerString(value)).toBe(expected)
  })
})

describe('isLowercaseString', () => {
  test.each([
    ['abcd', true],
    ['a', true],
    ['A', false],
    ['aBc', false],
    ['', true],
    [' ', true],
    ['!@', true],
    [' a ', true],
    ['a12c@', true],
  ])(`isLowercaseString('%s') => %s`, (value, expected) => {
    expect(stringUtils.isLowercaseString(value)).toBe(expected)
  })
})

describe('isUppercaseString', () => {
  test.each([
    ['ABCD', true],
    ['A', true],
    ['a', false],
    ['AbC', false],
    ['', true],
    [' ', true],
    ['!@', true],
    [' A ', true],
    ['A12C@', true],
  ])(`isUppercaseString('%s') => %s`, (value, expected) => {
    expect(stringUtils.isUppercaseString(value)).toBe(expected)
  })
})

describe('pluralize', () => {
  test('it pluralizes the word with the expected suffix', () => {
    expect(stringUtils.pluralize({ text: 'record', count: 2, suffix: 's' })).toBe('records')
  })

  test('it returns the word as-is if the count is 1', () => {
    expect(stringUtils.pluralize({ text: 'record', count: 1, suffix: 's' })).toBe('record')
  })
})

describe('removePrefixCharacters', () => {
  test.each([
    ['ABCD', 'A', 'BCD'],
    ['AAaBCD', 'A', 'aBCD'],
    ['aAABCD', 'A', 'aAABCD'],
    ['///apple///', '/', 'apple///'],
    ['|+|hello|+|', '|+|', '+|hello|+|'],
    ['', 'abc', ''],
    ['abc', '', 'abc'],
    ['   A', ' ', 'A'],
  ])(`removePrefixCharacters('%s', '%s') => '%s'`, (s, prefix, expected) => {
    expect(stringUtils.removePrefixCharacters(s, prefix)).toBe(expected)
  })
})

describe('uncapitalize', () => {
  test('it uncapitalizes the first letter', () => {
    expect(stringUtils.uncapitalize('')).toBe('')
    expect(stringUtils.uncapitalize('A')).toBe('a')
    expect(stringUtils.uncapitalize('AB')).toBe('aB')
  })
})
