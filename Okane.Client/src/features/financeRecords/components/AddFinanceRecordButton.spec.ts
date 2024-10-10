// Internal
import AddFinanceRecordButton from '@features/financeRecords/components/AddFinanceRecordButton.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  useSaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

const mountComponent = getMountComponent(AddFinanceRecordButton, {
  global: {
    provide: {
      [SAVE_FINANCE_RECORD_SYMBOL]: useSaveFinanceRecordProvider(),
    },
  },
})

test('renders a button to add a finance record', () => {
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  expect(button.text()).toBe(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.SHOW_MODAL)
})

test('updates the creating state on click', async () => {
  const saveProvider = useSaveFinanceRecordProvider()
  const wrapper = mountComponent({
    global: {
      provide: {
        [SAVE_FINANCE_RECORD_SYMBOL]: saveProvider,
      },
    },
  })

  expect(saveProvider.isCreating).toBe(false)

  const button = wrapper.get('button')
  await button.trigger('click')

  expect(saveProvider.isCreating).toBe(true)
})
