// External
import { type HttpHandler } from 'msw'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FinancesOverTimeChart from '@features/financeRecords/components/stats/FinancesOverTimeChart.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'
import VueChart from '@shared/components/charts/VueChart.vue'

import { DEFAULT_FINANCES_TIME_INTERVAL } from '@features/financeRecords/constants/stats'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { TIME_INTERVAL, TIME_INTERVAL_OPTIONS } from '@shared/constants/dateTime'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { createTestFinanceRecordsStats } from '@tests/factories/financeRecord'
import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'
import { testServer } from '@tests/msw/testServer'

const stats = createTestFinanceRecordsStats()

async function mountComponent(
  handler: HttpHandler = financeRecordHandlers.getStatsSuccess({ stats }),
) {
  testServer.use(handler)

  const wrapper = getMountComponent(FinancesOverTimeChart, {
    global: {
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

test('renders a select to choose a time interval', async () => {
  const wrapper = await mountComponent()
  const formSelect = wrapper.getComponent(FormSelect)
  expect(formSelect.findByText('label', SHARED_COPY.TIME_INTERVAL.LABEL)).toBeDefined()

  const select = formSelect.get(`select[name="timeInterval"]`)

  commonAsserts.rendersExpectedSelectOptions({
    expectedOptions: TIME_INTERVAL_OPTIONS,
    select,
  })

  const selectElement = select.element as HTMLSelectElement
  expect(selectElement.value).toBe(DEFAULT_FINANCES_TIME_INTERVAL)

  await select.setValue(TIME_INTERVAL.DAY)
  expect(selectElement.value).toBe(TIME_INTERVAL.DAY)
})

test('does not render an error', async () => {
  const wrapper = await mountComponent()
  expect(wrapper.findComponent(ErrorMessage).exists()).toBe(false)
})

describe('when fetching stats fails', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent(financeRecordHandlers.getStatsError())
    await flushPromises()
  })

  test('it renders an error', () => {
    const error = wrapper.getComponent(ErrorMessage)
    expect(error.text()).toBe(FINANCES_COPY.STATS.FETCH_ERROR)
  })
})
