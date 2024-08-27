// External
import { defineComponent, toRef } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_QUERY_KEYS,
} from '@features/financeRecords/constants/financeRecord.constants'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation.composable'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

import { createStubFinanceRecord } from '@tests/factories/financeRecord.factory'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInAPIResponse } from '@tests/factories/apiResponse.factory'

const financeRecord = createStubFinanceRecord()
const searchFilters = toRef(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)

const spyOn = {
  post() {
    return vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInAPIResponse('ok'))
  },
  invalidateQueries() {
    return vi.spyOn(testQueryClient, 'invalidateQueries')
  },
}

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup(props) {
    const mutation = useCreateFinanceRecordMutation(
      props.shouldPassSearchFilters ? searchFilters : undefined,
    )
    mutation.mutate(financeRecord)
  },
  template: '<div />',
})

function mountComponent(shouldPassSearchFilters = false) {
  return getMountComponent(TestComponent, {
    withQueryClient: true,
    props: {
      shouldPassSearchFilters,
    },
  })()
}

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountComponent()

  await flushPromises()

  expect(postSpy).toHaveBeenCalledWith('/finance-records', financeRecord)
})

test('does not invalidate the query key when no search filters are passed', async () => {
  spyOn.post()

  const invalidateSpy = spyOn.invalidateQueries()

  mountComponent()

  await flushPromises()

  expect(invalidateSpy).not.toHaveBeenCalled()
})

test('invalidates the query key when search filters are passed', async () => {
  spyOn.post()

  const invalidateSpy = spyOn.invalidateQueries()

  mountComponent(true)

  await flushPromises()

  const queryKey = FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS(searchFilters.value)

  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey })
})
