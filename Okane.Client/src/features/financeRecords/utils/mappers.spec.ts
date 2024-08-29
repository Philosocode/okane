// Internal
import * as utils from '@features/financeRecords/utils/mappers'

import { createTestSaveFinanceRecordFormState } from '@tests/factories/financeRecord'

describe('mapSaveFinanceRecordFormStateToFinanceRecord', () => {
  test('maps the form state to a finance record', () => {
    const formState = createTestSaveFinanceRecordFormState()
    const result = utils.mapSaveFinanceRecordFormStateToFinanceRecord(formState)

    expect(result).toEqual({
      ...result,
      happenedAt: new Date(formState.happenedAt),
    })
  })
})
