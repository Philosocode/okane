// Internal
import * as objectUtils from '@shared/utils/object'

describe('isObjectType', () => {
  test.each([
    [1, false],
    ['hey', false],
    [true, false],
    [[1, 2, 3], false],
    [undefined, false],
    [new Date(), false],
    [null, false],
    [{}, true],
  ])('isObjectType(%s) => %s', (input, expected) => {
    expect(objectUtils.isObjectType(input)).toBe(expected)
  })

  test('returns false for non-object types')
})

describe('objectHasKey', () => {
  const { objectHasKey } = objectUtils

  test('returns true if object contains key', () => {
    const obj = { a: 1 }
    expect(objectHasKey(obj, 'a')).toBe(true)
  })

  test('returns false if the object does not contain the key', () => {
    const obj = { a: 1 }
    expect(objectHasKey(obj, 'b')).toBe(false)
  })

  test("returns false for keys that belong to the object's prototype", () => {
    const obj = { b: 1 }
    expect(objectHasKey(obj, 'a')).toBe(false)
  })
})

describe('omitObjectKeys', () => {
  const { omitObjectKeys } = objectUtils
  const obj = { a: 1, b: 2, c: 3 }

  test('returns a clone of the object without the passed keys', () => {
    expect(omitObjectKeys(obj, ['a'])).toEqual({ b: obj.b, c: obj.c })
    expect(omitObjectKeys(obj, ['a', 'b'])).toEqual({ c: obj.c })
  })

  test('returns an unmodified clone if no keys are passed', () => {
    expect(omitObjectKeys(obj, [])).toEqual(obj)
  })

  test('does not mutate the original object', () => {
    const original = { ...obj }

    omitObjectKeys(obj, ['a', 'b', 'c'])

    expect(obj).toEqual(original)
  })
})
