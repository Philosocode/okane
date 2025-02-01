// External
import { format } from 'date-fns'

import { type VueWrapper } from '@vue/test-utils'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import FinanceRecordListItemTags from '@features/financeRecords/components/financeRecordList/FinanceRecordListItemTags.vue'
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { ARIA_ATTRIBUTES } from '@shared/constants/aria'
import { COMMON_DATE_TIME_FORMAT } from '@shared/constants/dateTime'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  DELETE_FINANCE_RECORD_ID_SYMBOL,
  useDeleteFinanceRecordId,
  type DeleteFinanceRecordIdProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordIdProvider'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  useSaveFinanceRecordProvider,
  type SaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { createTestTag } from '@tests/factories/tag'

const tags = [createTestTag({ id: 1, name: 'Tag 1' }), createTestTag({ id: 2, name: 'Tag 2' })]
const financeRecord = createTestFinanceRecord({ tags })
const mountComponent = getMountComponent(FinanceRecordListItem, {
  props: { financeRecord },
  global: {
    provide: {
      [DELETE_FINANCE_RECORD_ID_SYMBOL]: useDeleteFinanceRecordId(),
      [SAVE_FINANCE_RECORD_SYMBOL]: useSaveFinanceRecordProvider(),
    },
  },
})

test('renders the amount', () => {
  const wrapper = mountComponent()
  const amount = wrapper.findByText('div', financeRecord.amount.toString())
  expect(amount.exists()).toBe(true)
})

test('renders the timestamp', () => {
  const wrapper = mountComponent()
  const timestamp = wrapper.findByText(
    'p',
    format(financeRecord.happenedAt, COMMON_DATE_TIME_FORMAT),
  )
  expect(timestamp).toBeDefined()
})

test('renders the description', () => {
  const wrapper = mountComponent()
  const description = wrapper.findByText('p', financeRecord.description.toString())
  expect(description.exists()).toBe(true)
})

test('renders the tags', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(FinanceRecordListItemTags).exists()).toBe(true)
})

test('renders a menu', async () => {
  const wrapper = mountComponent()
  const menuComponent = wrapper.findComponent(ToggleMenu)
  expect(menuComponent.exists()).toBe(true)

  const toggleButton = menuComponent.get(`button[${ARIA_ATTRIBUTES.HAS_POPUP}]`)
  await toggleButton.trigger('click')

  const menu = wrapper.find('ul[role="menu"]')
  expect(menu.attributes('id')).toBe(`toggle-menu-${financeRecord.id}`)
})

describe('with the menu open', () => {
  let wrapper: VueWrapper
  let deleteProvider: DeleteFinanceRecordIdProvider
  let saveProvider: SaveFinanceRecordProvider

  beforeEach(async () => {
    deleteProvider = useDeleteFinanceRecordId()
    saveProvider = useSaveFinanceRecordProvider()

    wrapper = mountComponent({
      global: {
        provide: {
          [DELETE_FINANCE_RECORD_ID_SYMBOL]: deleteProvider,
          [SAVE_FINANCE_RECORD_SYMBOL]: saveProvider,
        },
      },
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

    expect(deleteProvider.id).toBeUndefined()
    await deleteButton.trigger('click')
    expect(deleteProvider.id).toBe(financeRecord.id)
  })
})
