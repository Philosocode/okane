// Internal
import * as utils from '@shared/utils/array.utils'

describe('getRange', () => {
  test('returns an empty array when end <= start', () => {
    expect(utils.getRange({ end: 1, start: 1 })).toEqual([])
    expect(utils.getRange({ end: 2, start: 3 })).toEqual([])
  })

  test('returns an array of numbers from start to end', () => {
    expect(utils.getRange({ end: 3 })).toEqual([0, 1, 2, 3])
  })
})
