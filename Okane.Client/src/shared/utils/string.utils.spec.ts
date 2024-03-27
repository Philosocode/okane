// Internal
import * as stringUtils from '@shared/utils/string.utils'

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
