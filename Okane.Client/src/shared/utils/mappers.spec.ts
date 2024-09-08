import * as utils from '@shared/utils/mappers'

describe('createMappers', () => {
  test('wraps the passed mappers in an object with a "to" property', () => {
    const mappers = {
      a: () => 'a',
      b: () => 'b',
    }
    const result = utils.createMappers(mappers)
    expect(result).toEqual({ to: mappers })
  })
})
