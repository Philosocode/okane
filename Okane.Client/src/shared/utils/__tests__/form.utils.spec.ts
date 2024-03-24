// Internal
import * as formUtils from 'src/shared/utils/form.utils'

describe('getUniqueFormId', () => {
  it('returns a unique, numeric ID', () => {
    const id1 = formUtils.getUniqueFormId()
    expect(id1).toBeNumeric()

    const id2 = formUtils.getUniqueFormId()
    expect(id2).toBeNumeric()

    expect(Number(id2)).toEqual(Number(id1) + 1)
  })
})
