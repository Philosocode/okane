// External
import { formatDate } from 'date-fns'

import { type VueWrapper } from '@vue/test-utils'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { ARIA_ATTRIBUTES } from '@shared/constants/aria'
import { FINANCE_RECORD_TIMESTAMP_FORMAT } from '@features/financeRecords/constants/financeRecordList'
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

const financeRecord = createTestFinanceRecord()
const mountComponent = getMountComponent(FinanceRecordListItem, {
  props: { financeRecord },
  global: {
    provide: {
      [DELETE_FINANCE_RECORD_ID_SYMBOL]: useDeleteFinanceRecordId(),
      [SAVE_FINANCE_RECORD_SYMBOL]: useSaveFinanceRecordProvider(),
    },
  },
})

test('renders the type', () => {
  const wrapper = mountComponent()
  const type = wrapper.findByText('span', financeRecord.type)
  expect(type.exists()).toBe(true)
})

test('renders the amount', () => {
  const wrapper = mountComponent()
  const amount = wrapper.findByText('div', financeRecord.amount.toString())
  expect(amount.exists()).toBe(true)
})

test('renders the type and timestamp', () => {
  const expectedTimestamp = formatDate(financeRecord.happenedAt, FINANCE_RECORD_TIMESTAMP_FORMAT)
  const wrapper = mountComponent()
  const topRow = wrapper.get('.top-row')
  expect(topRow.text()).toBe(`${financeRecord.type} - ${expectedTimestamp}`)
})

test('renders the description', () => {
  const wrapper = mountComponent()
  const description = wrapper.findByText('div', financeRecord.description.toString())
  expect(description.exists()).toBe(true)
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
