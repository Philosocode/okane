// External
import { type VueWrapper } from '@vue/test-utils'

// Internal
import FinanceUserTagGridItem from '@features/financeUserTags/components/FinanceUserTagGridItem.vue'
import FinanceUserTagGrid, {
  type FinanceUserTagGridProps,
} from '@features/financeUserTags/components/FinanceUserTagGrid.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { type FinanceUserTagMap } from '@features/financeUserTags/types/financeUserTag'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  useManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestTag } from '@tests/factories/tag'

const userTagMap: FinanceUserTagMap = {
  Expense: [
    createTestFinanceUserTag({
      id: 1,
      tag: createTestTag({ id: 2, name: '2' }),
    }),
    createTestFinanceUserTag({
      id: 2,
      tag: createTestTag({ id: 2, name: '2' }),
    }),
  ],
  Revenue: [],
}

function mountWithProvider(userTagType: FINANCE_RECORD_TYPE): VueWrapper {
  const props: FinanceUserTagGridProps = { userTagMap }
  const provider = useManageFinanceUserTagsProvider()
  provider.setUserTagType(userTagType)

  return getMountComponent(FinanceUserTagGrid, {
    global: {
      provide: {
        [MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL]: provider,
      },
    },
    props,
  })()
}

describe('when there are tags to display', () => {
  const userTagType = FINANCE_RECORD_TYPE.EXPENSE
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountWithProvider(userTagType)
  })

  test('renders a grid item for each matching user tag', () => {
    const gridItems = wrapper.findAllComponents(FinanceUserTagGridItem)
    expect(gridItems).toHaveLength(userTagMap[userTagType].length)

    userTagMap[userTagType].forEach((userTag) => {
      const hasMatchingElement = gridItems.some((gridItem) =>
        gridItem.findByText('p', userTag.tag.name),
      )
      expect(hasMatchingElement).toBe(true)
    })
  })

  test('does not render a "no tags" text', () => {
    const text = wrapper.findByText(
      'p',
      FINANCE_USER_TAGS_COPY.MANAGE_PAGE.NO_FINANCE_TAGS_TO_DISPLAY,
    )
    expect(text).toBeUndefined()
  })
})

describe('when there are no tags to display', () => {
  const userTagType = FINANCE_RECORD_TYPE.REVENUE
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountWithProvider(userTagType)
  })

  test('does not render any grid items', () => {
    const gridItems = wrapper.findAllComponents(FinanceUserTagGridItem)
    expect(gridItems).toHaveLength(0)
  })

  test('renders a "no tags" text', () => {
    const text = wrapper.findByText(
      'p',
      FINANCE_USER_TAGS_COPY.MANAGE_PAGE.NO_FINANCE_TAGS_TO_DISPLAY,
    )
    expect(text).toBeDefined()
  })
})
