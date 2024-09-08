// Internal
import AddFinanceRecordButton from '@features/financeRecords/components/AddFinanceRecordButton.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'

const mountComponent = getMountComponent(AddFinanceRecordButton, { withPinia: true })

test('renders a button to add a finance record', () => {
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  expect(button.text()).toBe(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.SHOW_MODAL)
})

test('updates the creating state on click', async () => {
  const saveStore = useSaveFinanceRecordStore()
  const wrapper = mountComponent()

  expect(saveStore.isCreating).toBe(false)

  const button = wrapper.get('button')
  await button.trigger('click')

  expect(saveStore.isCreating).toBe(true)
})
