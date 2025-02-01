// External
import { format } from 'date-fns'

import { type VueWrapper } from '@vue/test-utils'

// Internal
import FinanceRecordTags from '@features/financeRecords/components/financeRecordList/FinanceRecordTags.vue'
import FinanceRecordTypePill from '@features/financeRecords/components/financeRecordList/FinanceRecordTypePill.vue'
import ToggleMenu from '@shared/components/ToggleMenu.vue'
import VerticalDivider from '@shared/components/VerticalDivider.vue'
import FinanceRecordListItem, {
  type FinanceRecordListItemProps,
} from '@features/financeRecords/components/FinanceRecordListItem.vue'

import { ARIA_ATTRIBUTES } from '@shared/constants/aria'
import { COMMON_DATE_TIME_FORMAT } from '@shared/constants/dateTime'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  DELETE_FINANCE_RECORD_SYMBOL,
  useDeleteFinanceRecordProvider,
  type DeleteFinanceRecordProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordProvider'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  useSaveFinanceRecordProvider,
  type SaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { createTestTag } from '@tests/factories/tag'

const tags = [createTestTag({ id: 1, name: 'Tag 1' }), createTestTag({ id: 2, name: 'Tag 2' })]
const financeRecord = createTestFinanceRecord({ tags })
const defaultProps: FinanceRecordListItemProps = { financeRecord }
const mountComponent = getMountComponent(FinanceRecordListItem, {
  global: {
    provide: {
      [DELETE_FINANCE_RECORD_SYMBOL]: useDeleteFinanceRecordProvider(),
      [SAVE_FINANCE_RECORD_SYMBOL]: useSaveFinanceRecordProvider(),
    },
  },
})

test('renders the amount', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const amount = wrapper.findByText('div', financeRecord.amount.toString())
  expect(amount.exists()).toBe(true)
})

test('renders the timestamp', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const timestamp = wrapper.findByText(
    'p',
    format(financeRecord.happenedAt, COMMON_DATE_TIME_FORMAT),
  )
  expect(timestamp).toBeDefined()
})

test('renders the description', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const description = wrapper.findByText('p', financeRecord.description.toString())
  expect(description.exists()).toBe(true)
})

test('renders the type', () => {
  const wrapper = mountComponent({ props: defaultProps })
  expect(wrapper.findComponent(FinanceRecordTypePill).exists()).toBe(true)
})

test('renders a divider when there are tags', () => {
  const wrapper = mountComponent({ props: defaultProps })
  expect(wrapper.findComponent(VerticalDivider).exists()).toBe(true)
})

test('does not render a divider if there are no tags', () => {
  const wrapper = mountComponent({
    props: {
      financeRecord: createTestFinanceRecord({ tags: [] }),
    },
  })
  expect(wrapper.findComponent(VerticalDivider).exists()).toBe(false)
})

test('renders the tags', () => {
  const wrapper = mountComponent({ props: defaultProps })
  expect(wrapper.findComponent(FinanceRecordTags).exists()).toBe(true)
})

test('renders a menu', async () => {
  const wrapper = mountComponent({ props: defaultProps })
  const menuComponent = wrapper.findComponent(ToggleMenu)
  expect(menuComponent.exists()).toBe(true)

  const toggleButton = menuComponent.get(`button[${ARIA_ATTRIBUTES.HAS_POPUP}]`)
  await toggleButton.trigger('click')

  const menu = wrapper.find('ul[role="menu"]')
  expect(menu.attributes('id')).toBe(`toggle-menu-${financeRecord.id}`)
})

describe('with the menu open', () => {
  let wrapper: VueWrapper
  let deleteProvider: DeleteFinanceRecordProvider
  let saveProvider: SaveFinanceRecordProvider

  beforeEach(async () => {
    deleteProvider = useDeleteFinanceRecordProvider()
    saveProvider = useSaveFinanceRecordProvider()

    wrapper = mountComponent({
      global: {
        provide: {
          [DELETE_FINANCE_RECORD_SYMBOL]: deleteProvider,
          [SAVE_FINANCE_RECORD_SYMBOL]: saveProvider,
        },
      },
      props: defaultProps,
    })

    const menuComponent = wrapper.findComponent(ToggleMenu)
    const menuTrigger = menuComponent.get('button')
    await menuTrigger.trigger('click')
  })

  test('renders an option to edit a finance record', async () => {
    const editButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.EDIT)
    expect(editButton.exists()).toBe(true)

    expect(saveProvider.editingFinanceRecord).toBeUndefined()
    await editButton.trigger('click')
    expect(saveProvider.editingFinanceRecord).toEqual(financeRecord)
  })

  test('renders an option to delete a finance record', async () => {
    const deleteButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
    expect(deleteButton.exists()).toBe(true)

    expect(deleteProvider.financeRecordToDelete).toBeUndefined()
    await deleteButton.trigger('click')
    expect(deleteProvider.financeRecordToDelete).toEqual(financeRecord)
  })
})
