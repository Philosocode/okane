/**
 * Generate array containing whole numbers from start, start + 1, ..., emd - 1, end
 *
 * @param start
 * @param end
 */
export function getRange({ start = 0, end }: { start?: number; end: number }): number[] {
  if (end <= start) return []

  const nums: number[] = []

  for (let i = start; i <= end; i++) nums.push(i)

  return nums
}

/**
 * Insert an element into a sorted array.
 *
 * @param args
 * @param args.element The element to insert.
 * @param args.arr The array to insert into.
 * @param args.compareFn Compare func. Should return a negative number if a before b, 0 if a === b,
 *                       or a positive number if a > b. If there are multiple equal elements, element
 *                       will be placed before the first equal element.
 * @param args.inPlace Whether the array should be modified in-place.
 */
export function insertIntoSortedArray<T>(args: {
  element: T
  arr: T[]
  compareFn: (a: T, b: T) => number

  inPlace?: boolean
}): T[] {
  let arr = args.arr
  if (!args.inPlace) arr = [...args.arr]

  // Find the first thing in arr > args.element.
  let insertIdx = -1
  for (let i = 0; i < arr.length; i++) {
    // 1, [1, 2, 3] // 1, [0, 2]
    const compareResult = args.compareFn(args.element, arr[i])

    if (compareResult <= 0) {
      insertIdx = i
      break
    }
  }

  // No smaller or equal element was found; args.element is the max element.
  if (insertIdx === -1) insertIdx = arr.length

  arr.splice(insertIdx, 0, args.element)

  return arr
}
