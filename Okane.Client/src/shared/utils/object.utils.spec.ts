// Internal
import * as objectUtils from '@/shared/utils/object.utils'

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
