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
