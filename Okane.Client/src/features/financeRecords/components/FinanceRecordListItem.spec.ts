// External
import { formatDate } from 'date-fns'

import { type VueWrapper } from '@vue/test-utils'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { FINANCE_RECORD_TIMESTAMP_FORMAT } from '@features/financeRecords/constants/financeRecordList'
import { SHARED_COPY } from '@shared/constants/copy'

import { useDeleteFinanceRecordStore } from '@features/financeRecords/composables/useDeleteFinanceRecordStore'
import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

const financeRecord = createTestFinanceRecord()
const mountComponent = getMountComponent(FinanceRecordListItem, {
  props: { financeRecord },
  withPinia: true,
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

  const toggleButton = menuComponent.get(`button[aria-haspopup]`)
  await toggleButton.trigger('click')

  const menu = wrapper.find('ul[role="menu"]')
  expect(menu.attributes('id')).toBe(`toggle-menu-${financeRecord.id}`)
})

describe('with the menu open', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()

    const menuComponent = wrapper.findComponent(ToggleMenu)
    const menuTrigger = menuComponent.get('button')
    await menuTrigger.trigger('click')
  })

  test('renders an option to edit a finance record', async () => {
    const editButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.EDIT)
    expect(editButton.exists()).toBe(true)

    const saveStore = useSaveFinanceRecordStore()
    expect(saveStore.editingFinanceRecord).toBeUndefined()
    await editButton.trigger('click')
    expect(saveStore.editingFinanceRecord).toEqual(financeRecord)
  })

  test('renders an option to delete a finance record', async () => {
    const deleteButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
    expect(deleteButton.exists()).toBe(true)

    const deleteStore = useDeleteFinanceRecordStore()
    expect(deleteStore.financeRecordId).toBeUndefined()
    await deleteButton.trigger('click')
    expect(deleteStore.financeRecordId).toBe(financeRecord.id)
  })
})
