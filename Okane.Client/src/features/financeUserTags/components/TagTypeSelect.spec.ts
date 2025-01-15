// External
import { flushPromises } from '@vue/test-utils'

// Internal
import TagTypeSelect from '@features/financeUserTags/components/TagTypeSelect.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  useManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

function mountComponent() {
  const provider = useManageFinanceUserTagsProvider()
  const wrapper = getMountComponent(TagTypeSelect, {
    global: {
      provide: {
        [MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL]: provider,
      },
    },
  })()

  return { provider, wrapper }
}

test('renders a select with label', async () => {
  const { provider, wrapper } = mountComponent()
  const type = FINANCE_RECORD_TYPE.REVENUE
  provider.setUserTagType(type)
  await flushPromises()

  const select = wrapper.get('select')
  expect(select.attributes('name')).toBe('tagType')

  const selectElement = select.element as HTMLSelectElement
  expect(selectElement.value).toBe(type)

  const label = wrapper.findByText('label', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.TAG_TYPE)
  expect(label).toBeDefined()
})

test('renders the expected options', () => {
  const { wrapper } = mountComponent()

  const expenseOption = wrapper.get(`option[value="${FINANCE_RECORD_TYPE.EXPENSE}"]`)
  expect(expenseOption.attributes('selected')).toBeDefined()

  const revenueOption = wrapper.get(`option[value="${FINANCE_RECORD_TYPE.REVENUE}"]`)
  expect(revenueOption.attributes('selected')).toBeUndefined()
})

test('updates the provider user tag type on option select', async () => {
  const { provider, wrapper } = mountComponent()
  const select = wrapper.get('select')
  const type = FINANCE_RECORD_TYPE.REVENUE
  await select.setValue(type)
  expect(provider.userTagType).toBe(type)
})
