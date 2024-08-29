// Internal
import * as formUtils from '@shared/utils/form'

describe('getUniqueFormControlId', () => {
  test('returns a unique, numeric ID', () => {
    const id1 = formUtils.getUniqueFormControlId()
    expect(id1).toBeNumeric()

    const id2 = formUtils.getUniqueFormControlId()
    expect(id2).toBeNumeric()

    expect(Number(id2)).toEqual(Number(id1) + 1)
  })
})

describe('getInitialFormErrors', () => {
  test('returns a new object with the same keys and values set to empty strings', () => {
    const formState = { a: 1, b: 2 }
    const expected = { a: '', b: '' }
    const actual = formUtils.getInitialFormErrors(formState)

    expect(actual).toEqual(expected)
  })

  test('returns an empty object when given an empty object', () => {
    expect({}).toEqual(formUtils.getInitialFormErrors({}))
  })
})
