// Internal
import * as utils from '@features/financeRecords/utils/mappers'

import { createTestSaveFinanceRecordFormState } from '@tests/factories/financeRecord'

describe('mapSaveFinanceRecordFormState', () => {
  test('maps the form state to a pre-creation finance record', () => {
    const formState = createTestSaveFinanceRecordFormState()
    const result = utils.mapSaveFinanceRecordFormState.to.preCreationFinanceRecord(formState)

    expect(result).toEqual({
      ...result,
      happenedAt: new Date(formState.happenedAt),
    })
  })
})
