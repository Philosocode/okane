// Internal
import * as utils from '@shared/utils/array'

describe('getRange', () => {
  test('returns an empty array when end <= start', () => {
    expect(utils.getRange({ end: 1, start: 1 })).toEqual([])
    expect(utils.getRange({ end: 2, start: 3 })).toEqual([])
  })

  test('returns an array of numbers from start to end', () => {
    expect(utils.getRange({ end: 3 })).toEqual([0, 1, 2, 3])
  })
})

describe('insertIntoSortedArray', () => {
  function compareNumbers(n1: number, n2: number) {
    if (n1 === n2) return 0
    if (n1 < n2) return -1
    return 1
  }

  test('inserts into an empty array', () => {
    const arr: number[] = []
    const result = utils.insertIntoSortedArray({ arr, element: 1, compareFn: compareNumbers })
    expect(result).toEqual([1])
  })

  test('inserts at the beginning', () => {
    const arr = [2]
    const result = utils.insertIntoSortedArray({ arr, element: 1, compareFn: compareNumbers })
    expect(result).toEqual([1, 2])
  })

  test('inserts in the middle', () => {
    const arr = [0, 2]
    const result = utils.insertIntoSortedArray({ arr, element: 1, compareFn: compareNumbers })
    expect(result).toEqual([0, 1, 2])
  })

  test('inserts at the end', () => {
    const arr = [0]
    const result = utils.insertIntoSortedArray({ arr, element: 1, compareFn: compareNumbers })
    expect(result).toEqual([0, 1])
  })

  test('deals with duplicate elements', () => {
    const arr = [0, 1, 2]
    const result = utils.insertIntoSortedArray({ arr, element: 1, compareFn: compareNumbers })
    expect(result).toEqual([0, 1, 1, 2])
  })

  test('does not mutate the array when inPlace is falsy', () => {
    const arr: number[] = []
    utils.insertIntoSortedArray({ arr, element: 1, compareFn: compareNumbers })
    expect(arr).toEqual([])
  })

  test('mutates the array when inPlace is truthy', () => {
    const arr: number[] = []
    utils.insertIntoSortedArray({ arr, element: 1, compareFn: compareNumbers, inPlace: true })
    expect(arr).toEqual([1])
  })

  test('works with strings', () => {
    function compareLowerStrings(a: string, b: string) {
      const aLower = a.toLocaleLowerCase()
      const bLower = b.toLocaleLowerCase()

      if (aLower === bLower) return 0
      if (aLower < bLower) return -1
      return 1
    }

    const arr = ['A', 'aa', 'B']
    const result = utils.insertIntoSortedArray({
      arr,
      element: 'aaa',
      compareFn: compareLowerStrings,
    })
    expect(result).toEqual(['A', 'aa', 'aaa', 'B'])
  })
})
