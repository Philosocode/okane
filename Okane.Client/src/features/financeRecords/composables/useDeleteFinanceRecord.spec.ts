// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { useDeleteFinanceRecord } from '@features/financeRecords/composables/useDeleteFinanceRecord'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { removeItemFromPages } from '@shared/utils/pagination'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import {
  createTestFinanceRecord,
  createTestFinanceRecordsStats,
} from '@tests/factories/financeRecord'
import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'

const spyOn = {
  delete() {
    return vi.spyOn(apiClient, 'delete').mockResolvedValue()
  },
}

const financeRecord = createTestFinanceRecord()

function createTestComponent(financeRecordToDelete = financeRecord) {
  return defineComponent({
    props: {
      shouldPassSearchFilters: Boolean,
    },
    setup() {
      const mutation = useDeleteFinanceRecord()
      mutation.mutate(financeRecordToDelete)
    },
    template: '<div />',
  })
}

const TestComponent = createTestComponent()

function mountWithProviders(args: { searchProvider?: SearchFinanceRecordsProvider } = {}) {
  let searchProvider = args.searchProvider
  if (!searchProvider) searchProvider = useSearchFinanceRecordsProvider()

  return getMountComponent(TestComponent, {
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: searchProvider,
      },
    },
    withQueryClient: true,
  })()
}

test('makes a DELETE request to the expected endpoint', async () => {
  const deleteSpy = spyOn.delete()

  mountWithProviders()
  await flushPromises()

  expect(deleteSpy).toHaveBeenCalledWith(
    financeRecordAPIRoutes.deleteFinanceRecord({ id: financeRecord.id }),
  )
})

test('removes the finance record from the query cache', async () => {
  const initialCachedData = {
    pages: [
      wrapInApiPaginatedResponse(
        wrapInApiResponse([
          createTestFinanceRecord({ id: financeRecord.id }),
          createTestFinanceRecord({ id: 2 }),
          createTestFinanceRecord({ id: 3 }),
        ]),
      ),
    ],
    pageParams: [],
  }

  const searchProvider = useSearchFinanceRecordsProvider()
  const queryKey = financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters })
  testQueryClient.setQueryData(queryKey, initialCachedData)

  spyOn.delete()
  mountWithProviders({ searchProvider })
  await flushPromises()

  const cachedData = testQueryClient.getQueryData(queryKey)
  expect(cachedData).toEqual(
    removeItemFromPages(initialCachedData, (item) => item.id !== financeRecord.id),
  )
})

async function assertUpdatesCachedStats(deletedFinanceRecord: FinanceRecord) {
  const initialStats = createTestFinanceRecordsStats()
  const initialCachedData = wrapInApiResponse(initialStats)

  const searchProvider = useSearchFinanceRecordsProvider()
  const queryKey = financeRecordQueryKeys.stats({ filters: searchProvider.filters })
  testQueryClient.setQueryData(queryKey, initialCachedData)

  spyOn.delete()

  getMountComponent(createTestComponent(deletedFinanceRecord), {
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: searchProvider,
      },
    },
    withQueryClient: true,
  })()
  await flushPromises()

  const expectedStats = { ...initialStats }
  if (deletedFinanceRecord.type === 'Expense') {
    expectedStats.totalExpenses -= deletedFinanceRecord.amount
    expectedStats.expenseRecords--
  }
  if (deletedFinanceRecord.type === 'Revenue') {
    expectedStats.totalRevenue -= deletedFinanceRecord.amount
    expectedStats.revenueRecords--
  }

  const cachedData = testQueryClient.getQueryData(queryKey)
  expect(cachedData).toEqual(wrapInApiResponse(expectedStats))
}

test('updates cached stats when removing an expense finance record', async () => {
  await assertUpdatesCachedStats({ ...financeRecord, type: FINANCE_RECORD_TYPE.EXPENSE })
})

test('updates cached stats when removing a revenue finance record', async () => {
  await assertUpdatesCachedStats({ ...financeRecord, type: FINANCE_RECORD_TYPE.REVENUE })
})
