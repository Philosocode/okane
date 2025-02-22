// External
import { type HttpHandler } from 'msw'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FinancesPieChart from '@features/financeRecords/components/stats/FinancesPieChart.vue'
import VueChart from '@shared/components/charts/VueChart.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { createTestFinanceRecordsStats } from '@tests/factories/financeRecord'
import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'
import { testServer } from '@tests/msw/testServer'

const stats = createTestFinanceRecordsStats()

async function mountComponent(
  handler: HttpHandler = financeRecordHandlers.getStatsSuccess({ stats }),
) {
  testServer.use(handler)

  const wrapper = getMountComponent(FinancesPieChart, {
    global: {
      provide: {
        [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: useFinanceRecordSearchFiltersProvider(),
      },
      stubs: {
        VueChart: true,
      },
    },
    withQueryClient: true,
  })()

  await flushPromises()

  return wrapper
}

test('renders a chart', async () => {
  const wrapper = await mountComponent()
  expect(wrapper.findComponent(VueChart).exists()).toBe(true)
})

test('does not render an error', async () => {
  const wrapper = await mountComponent()
  expect(wrapper.findComponent(ErrorMessage).exists()).toBe(false)
})

describe('when fetching stats fails', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent(financeRecordHandlers.getStatsError())
  })

  test('it renders an error', () => {
    const error = wrapper.getComponent(ErrorMessage)
    expect(error.text()).toBe(FINANCES_COPY.STATS.FETCH_ERROR)
  })
})
