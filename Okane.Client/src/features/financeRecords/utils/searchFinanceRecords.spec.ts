// Internal
import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'

import * as utils from '@features/financeRecords/utils/searchFinanceRecords'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

describe('getFinanceRecordsSearchCursor', () => {
  const financeRecord = createTestFinanceRecord()

  test('returns an empty object when lastFinanceRecord is empty', () => {
    expect(utils.getFinanceRecordsSearchCursor(DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS)).toEqual({})
  })

  test('returns the expected cursor when sorting by amount', () => {
    const cursor = utils.getFinanceRecordsSearchCursor(
      {
        ...DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,
        sortField: 'amount',
      },
      financeRecord,
    )
    expect(cursor).toEqual({ id: financeRecord.id, amount: financeRecord.amount })
  })

  test('returns the expected cursor when sorting by happenedAt', () => {
    const cursor = utils.getFinanceRecordsSearchCursor(
      {
        ...DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,
        sortField: 'happenedAt',
      },
      financeRecord,
    )
    expect(cursor).toEqual({ id: financeRecord.id, happenedAt: financeRecord.happenedAt })
  })
})
