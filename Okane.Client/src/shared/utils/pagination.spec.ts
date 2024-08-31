// Internal
import * as utils from '@shared/utils/pagination'

import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

describe('flattenPages', () => {
  test.each([[undefined], [[]]])('flattenPages(%s) -> []', (input) => {
    expect(utils.flattenPages(input)).toEqual([])
  })

  test('returns a flattened array of items', () => {
    const pages = [
      wrapInAPIPaginatedResponse(wrapInAPIResponse([1, 2, 3])),
      wrapInAPIPaginatedResponse(wrapInAPIResponse([4, 5]), { currentPage: 2, pageSize: 3 }),
    ]
    const result = utils.flattenPages(pages)

    expect(result).toEqual([...pages[0].items, ...pages[1].items])
  })
})

describe('removeItemFromPages', () => {
  test('does nothing when the data is not an array', () => {
    const data = { a: 1, b: 2 } as any
    const result = utils.removeItemFromPages(data, () => true)

    expect(result).toEqual(data)
  })

  test('removes items where the callback returns true', () => {
    const data = {
      pages: [
        wrapInAPIPaginatedResponse(wrapInAPIResponse(1)),
        wrapInAPIPaginatedResponse(wrapInAPIResponse(2)),
        wrapInAPIPaginatedResponse(wrapInAPIResponse(3)),
      ],
      pageParams: [1, 2, 3],
    }

    const result = utils.removeItemFromPages(data, (item) => item !== 1)
    expect(result).toEqual({
      pages: [
        {
          ...data.pages[0],
          items: [],
          totalItems: data.pages[0].totalItems - 1,
        },
        data.pages[1],
        data.pages[2],
      ],
      pageParams: [1, 2, 3],
    })
  })
})
