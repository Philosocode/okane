// Internal
import * as utils from '@features/financeRecords/utils/financeRecord.utils'
import { createStubSaveFinanceRecordFormState } from '@tests/factories/financeRecord.factory'

describe('mapSaveFinanceRecordFormStateToFinanceRecord', () => {
  test('maps the form state to a finance record', () => {
    const formState = createStubSaveFinanceRecordFormState()
    const result = utils.mapSaveFinanceRecordFormStateToFinanceRecord(formState)

    expect(result).toEqual({
      ...result,
      happenedAt: new Date(formState.happenedAt),
    })
  })
})
