// Internal
import * as utils from '@shared/utils/pagination'

import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'

describe('flattenPages', () => {
  test.each([[undefined], [[]]])('flattenPages(%s) -> []', (input) => {
    expect(utils.flattenPages(input)).toEqual([])
  })

  test('returns a flattened array of items', () => {
    const pages = [
      wrapInApiPaginatedResponse(wrapInApiResponse([1, 2, 3])),
      wrapInApiPaginatedResponse(wrapInApiResponse([4, 5])),
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
        wrapInApiPaginatedResponse(wrapInApiResponse(1)),
        wrapInApiPaginatedResponse(wrapInApiResponse(2)),
        wrapInApiPaginatedResponse(wrapInApiResponse(3)),
      ],
      pageParams: [1, 2, 3],
    }

    const result = utils.removeItemFromPages(data, (item) => item !== 1)
    expect(result).toEqual({
      pages: [
        {
          ...data.pages[0],
          items: [],
        },
        data.pages[1],
        data.pages[2],
      ],
      pageParams: [1, 2, 3],
    })
  })
})
