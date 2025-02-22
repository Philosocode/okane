// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
import FinanceCharts from '@features/financeRecords/components/stats/FinanceCharts.vue'
import FinancesOverTimeChart from '@features/financeRecords/components/stats/FinancesOverTimeChart.vue'
import FinancesPieChart from '@features/financeRecords/components/stats/FinancesPieChart.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { TEST_IDS } from '@shared/constants/testIds'

const mountComponent = getMountComponent(FinanceCharts, {
  global: {
    stubs: {
      FinancesPieChart: true,
      FinancesOverTimeChart: true,
    },
  },
})

test('renders a heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.getComponent(CardHeading)
  expect(heading.text()).toBe(FINANCES_COPY.CHARTS.HEADING)
})

test('renders button to toggle charts visibility', async () => {
  const wrapper = mountComponent({ attachTo: document.body })
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.SHOW)
  expect(button).toBeDefined()

  const chartsContainerSelector = `[data-testid="${TEST_IDS.FINANCE_CHARTS_CONTAINER}"]`
  const chartsContainer = wrapper.get(chartsContainerSelector)
  expect(chartsContainer.isVisible()).toBe(false)

  await button.trigger('click')
  expect(chartsContainer.isVisible()).toBe(true)
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.HIDE)
})

test('renders a pie chart', () => {
  const wrapper = mountComponent()
  const chart = wrapper.findComponent(FinancesPieChart)
  expect(chart.exists()).toBe(true)
})

test('renders a finances over time chart', () => {
  const wrapper = mountComponent()
  const chart = wrapper.findComponent(FinancesOverTimeChart)
  expect(chart.exists()).toBe(true)
})
