// Internal
import * as formUtils from '@/shared/utils/form.utils'

describe('getUniqueFormControlId', () => {
  test('returns a unique, numeric ID', () => {
    const id1 = formUtils.getUniqueFormControlId()
    expect(id1).toBeNumeric()

    const id2 = formUtils.getUniqueFormControlId()
    expect(id2).toBeNumeric()

    expect(Number(id2)).toEqual(Number(id1) + 1)
  })
})
