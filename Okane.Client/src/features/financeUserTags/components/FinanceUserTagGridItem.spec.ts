// Internal
import FinanceUserTagGridItem from '@features/financeUserTags/components/FinanceUserTagGridItem.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  useManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { flushPromises } from '@vue/test-utils'

function mountWithProvider() {
  const provider = useManageFinanceUserTagsProvider()

  const wrapper = getMountComponent(FinanceUserTagGridItem, {
    global: {
      provide: {
        [MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL]: provider,
      },
    },
    props: { userTag },
  })()

  return { provider, wrapper }
}

const userTag = createTestFinanceUserTag()

test('renders the tag name', () => {
  const { wrapper } = mountWithProvider()
  const name = wrapper.findByText('p', userTag.tag.name)
  expect(name).toBeDefined()
})

test('renders a rename button', async () => {
  const { provider, wrapper } = mountWithProvider()
  const icon = wrapper.findByText('title', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.RENAME_FINANCE_TAG)
  await icon.trigger('click')
  await flushPromises()
  expect(provider.userTagToRename).toEqual(userTag)
})

test('renders a delete button', async () => {
  const { provider, wrapper } = mountWithProvider()
  const icon = wrapper.findByText('title', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.DELETE_FINANCE_TAG)
  await icon.trigger('click')
  await flushPromises()
  expect(provider.userTagToDelete).toEqual(userTag)
})
