// External
import { flushPromises, VueWrapper } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'

// Internal
import Heading from '@shared/components/Heading.vue'
import TotalAmountCell from '@features/financeRecords/components/TotalAmountCell.vue'
import TotalRevenueAndExpenses from '@features/financeRecords/components/TotalRevenueAndExpenses.vue'

import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { HTML_ROLE } from '@shared/constants/html'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { pluralize } from '@shared/utils/string'

import { getMSWURL } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const mountComponent = getMountComponent(TotalRevenueAndExpenses, {
  global: {
    provide: {
      [SEARCH_FINANCE_RECORDS_SYMBOL]: useSearchFinanceRecordsProvider(),
    },
  },
  withQueryClient: true,
})

function useStatsHandler(stats: FinanceRecordsStats) {
  const url = getMSWURL(
    financeRecordAPIRoutes.getStats({
      searchFilters: DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,
    }),
  )
  testServer.use(http.get(url, () => HttpResponse.json(wrapInAPIResponse(stats))))
}

const sharedTests = {
  async rendersACell(args: {
    amount: number
    count: number
    getCell: (cells: VueWrapper[]) => VueWrapper
    headingText: string
    stats: FinanceRecordsStats
  }) {
    useStatsHandler(args.stats)
    const wrapper = mountComponent()
    await flushPromises()

    const cells = wrapper.findAllComponents(TotalAmountCell)
    const cell = args.getCell(cells)
    const heading = cell.findComponent(Heading)
    expect(heading.text()).toBe(args.headingText)

    const amount = cell.findByText('p', `$${args.amount.toFixed(2)}`)
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
  totalRevenue: 200.5,
}

test('renders a divider', () => {
  useStatsHandler(defaultStats)

  const wrapper = mountComponent()
  expect(wrapper.find(`div[role="${HTML_ROLE.SEPARATOR}"]`).exists()).toBe(true)
})

test('renders revenue stats', async () => {
  await sharedTests.rendersACell({
    amount: defaultStats.totalRevenue,
    count: defaultStats.revenueRecords,
    stats: defaultStats,
    headingText: FINANCES_COPY.RECORD_TYPES.REVENUE,
    getCell: (cells) => cells[0],
  })
})

test('renders expense stats', async () => {
  await sharedTests.rendersACell({
    amount: defaultStats.totalExpenses,
    count: defaultStats.expenseRecords,
    stats: defaultStats,
    headingText: FINANCES_COPY.STATS.EXPENSES,
    getCell: (cells) => cells[1],
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
