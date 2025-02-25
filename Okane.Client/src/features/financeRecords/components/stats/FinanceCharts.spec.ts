// External
import { type VueWrapper } from '@vue/test-utils'

// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
import FinanceCharts from '@features/financeRecords/components/stats/FinanceCharts.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { TEST_IDS } from '@shared/constants/testIds'

import { commonAsserts } from '@tests/utils/commonAsserts'

const mountComponent = getMountComponent(FinanceCharts, {
  global: {
    stubs: {
      FinancesPieChart: {
        template: `<div data-testid="FinancesPieChart" />`,
      },
      FinancesOverTimeChart: {
        template: `<div data-testid="FinancesOverTimeChart" />`,
      },
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
  let chartsContainer = wrapper.find(chartsContainerSelector)
  expect(chartsContainer.exists()).toBe(false)

  await button.trigger('click')
  chartsContainer = wrapper.find(chartsContainerSelector)
  expect(chartsContainer.exists()).toBe(true)
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.HIDE)
})

test('does not render a pie chart', () => {
  const wrapper = mountComponent()
  const chart = wrapper.find('[data-testid="FinancesPieChart"]')
  expect(chart.exists()).toBe(false)
})

test('does not render a finances over time chart', () => {
  const wrapper = mountComponent()
  const chart = wrapper.find('[data-testid="FinancesOverTimeChart"]')
  expect(chart.exists()).toBe(false)
})

describe('after clicking the show button', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent({ attachTo: document.body })

    const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.SHOW)
    await button.trigger('click')
  })

  test('renders a pie chart', () => {
    commonAsserts.rendersElementWithTestId({
      testId: 'FinancesPieChart',
      wrapper,
    })
  })

  test('renders a finances over time chart', () => {
    commonAsserts.rendersElementWithTestId({
      testId: 'FinancesOverTimeChart',
      wrapper,
    })
  })
})
