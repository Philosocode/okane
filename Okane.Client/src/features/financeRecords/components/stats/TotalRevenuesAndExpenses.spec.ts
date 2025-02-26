// External
import { flushPromises, VueWrapper } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'

// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
import TotalAmountCell from '@features/financeRecords/components/stats/TotalAmountCell.vue'
import TotalRevenuesAndExpenses from '@features/financeRecords/components/stats/TotalRevenuesAndExpenses.vue'
import VerticalDivider from '@shared/components/divider/VerticalDivider.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { DEFAULT_FINANCES_TIME_INTERVAL } from '@features/financeRecords/constants/stats'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'

import { pluralize } from '@shared/utils/string'

import { getMswUrl } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'
import { wrapInApiResponse } from '@tests/utils/apiResponse'
import { useToastStore } from '@shared/composables/useToastStore'
import { createTestProblemDetails } from '@tests/factories/problemDetails'

const mountComponent = getMountComponent(TotalRevenuesAndExpenses, {
  withQueryClient: true,
})

const getStatsUrl = getMswUrl(
  financeRecordApiRoutes.getStats({
    searchFilters: DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
    timeInterval: DEFAULT_FINANCES_TIME_INTERVAL,
  }),
)
function useStatsHandler(stats: FinanceRecordsStats) {
  testServer.use(http.get(getStatsUrl, () => HttpResponse.json(wrapInApiResponse(stats))))
}

const sharedTests = {
  async rendersACell(args: {
    amount: number
    count: number
    getCell: (cells: VueWrapper[]) => VueWrapper
    headingText: string
    stats: FinanceRecordsStats
    type: FINANCE_RECORD_TYPE
  }) {
    useStatsHandler(args.stats)
    const wrapper = mountComponent()
    await flushPromises()

    const cells = wrapper.findAllComponents(TotalAmountCell)
    const cell = args.getCell(cells)
    const heading = cell.findComponent(CardHeading)
    expect(heading.text()).toBe(args.headingText)

    const amount = cell.findByText(
      'p',
      FINANCES_COPY.STATS.TOTAL_AMOUNT({
        amount: args.amount,
        type: args.type,
      }),
    )
    expect(amount).toBeDefined()

    const countText = pluralize({
      text: FINANCES_COPY.STATS.RECORD,
      count: args.count,
      suffix: 's',
    })

    const count = cell.findByText('p', countText)
    expect(count).toBeDefined()
  },
}

const defaultStats: FinanceRecordsStats = {
  expenseRecords: 10,
  totalExpenses: 100.1,
  revenueRecords: 20,
  totalRevenues: 200.5,
  dates: [],
  revenuesByDate: [],
  expensesByDate: [],
}

test('renders a divider', () => {
  useStatsHandler(defaultStats)

  const wrapper = mountComponent()
  expect(wrapper.findComponent(VerticalDivider).exists()).toBe(true)
})

test('does not create an error toast', () => {
  useStatsHandler(defaultStats)

  const toastStore = useToastStore()
  mountComponent()
  expect(toastStore.toasts).toHaveLength(0)
})

test('renders revenue stats', async () => {
  await sharedTests.rendersACell({
    amount: defaultStats.totalRevenues,
    count: defaultStats.revenueRecords,
    stats: defaultStats,
    headingText: FINANCES_COPY.RECORD_TYPES.REVENUE,
    getCell: (cells) => cells[0],
    type: FINANCE_RECORD_TYPE.REVENUE,
  })
})

test('renders expense stats', async () => {
  await sharedTests.rendersACell({
    amount: defaultStats.totalExpenses,
    count: defaultStats.expenseRecords,
    stats: defaultStats,
    headingText: FINANCES_COPY.STATS.EXPENSES,
    getCell: (cells) => cells[1],
    type: FINANCE_RECORD_TYPE.EXPENSE,
  })
})

test('renders default amounts and counts while fetching stats', () => {
  useStatsHandler(defaultStats)

  const wrapper = mountComponent()
  const cells = wrapper.findAllComponents(TotalAmountCell)
  const defaultAmount = '$0.00'
  const defaultCount = `0 ${FINANCES_COPY.STATS.RECORD}s`

  cells.forEach((cell) => {
    const amount = cell.findByText('p', defaultAmount)
    expect(amount).toBeDefined()

    const count = cell.findByText('p', defaultCount)
    expect(count).toBeDefined()
  })
})

describe('with an error fetching stats', () => {
  test('creates an error toast', async () => {
    testServer.use(
      http.get(getStatsUrl, () =>
        HttpResponse.json(createTestProblemDetails(), {
          status: HTTP_STATUS_CODE.BAD_REQUEST_400,
        }),
      ),
    )

    const toastStore = useToastStore()
    mountComponent()
    await flushPromises()
    expect(toastStore.toasts).toHaveLength(1)
    expect(toastStore.toasts[0]).toEqual({
      id: expect.anything(),
      text: FINANCES_COPY.STATS.FETCH_ERROR,
      type: 'error',
    })
  })
})
