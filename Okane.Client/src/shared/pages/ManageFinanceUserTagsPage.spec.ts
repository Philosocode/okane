// External
import { defineComponent, inject } from 'vue'
import { flushPromises, type ComponentMountingOptions, type VueWrapper } from '@vue/test-utils'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type HttpHandler } from 'msw'

// Internal
import DeleteFinanceUserTagModal from '@features/financeUserTags/components/DeleteFinanceUserTagModal.vue'
import FinanceUserTagGrid from '@features/financeUserTags/components/FinanceUserTagGrid.vue'
import Loader from '@shared/components/loader/Loader.vue'
import ManageFinanceUserTagsPage from '@shared/pages/ManageFinanceUserTagsPage.vue'
import TagTypeSelect from '@features/financeUserTags/components/TagTypeSelect.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  useManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { testServer } from '@tests/msw/testServer'

const userTags = [createTestFinanceUserTag()]

function mountComponent(
  args: {
    mountingOptions?: ComponentMountingOptions<unknown>
    queryUserTagsHandler?: HttpHandler
  } = {},
) {
  testServer.use(args.queryUserTagsHandler ?? financeUserTagHandlers.getAllSuccess({ userTags }))

  return getMountComponent(ManageFinanceUserTagsPage, {
    global: {
      provide: {
        [MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL]: useManageFinanceUserTagsProvider(),
      },
    },
    withQueryClient: true,
  })(args.mountingOptions)
}

const sharedAsserts = {
  conditionallyRendersPageContent(args: { wrapper: VueWrapper; shouldExist: boolean }) {
    const elements = [
      args.wrapper.findComponent(DeleteFinanceUserTagModal),
      args.wrapper.findComponent(FinanceUserTagGrid),
      args.wrapper.findComponent(TagTypeSelect),
    ]

    elements.forEach((element) => {
      expect(element.exists()).toBe(args.shouldExist)
    })
  },
}

test('renders a heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText('h1', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.HEADING)
  expect(heading).toBeDefined()
})

test('renders a loader', () => {
  const wrapper = mountComponent()
  const loader = wrapper.findComponent(Loader)
  expect(loader.exists()).toBe(true)
})

test('does not render the page content', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(TagTypeSelect).exists()).toBe(false)
})

test('does not render an error', () => {
  const wrapper = mountComponent()
  const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.FETCH_TAGS_ERROR)
  expect(error).toBeUndefined()
})

test('provides manage finance user tags state', () => {
  const HeadingStub = defineComponent({
    setup() {
      const provider = inject(MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL)
      provider?.setUserTagType(FINANCE_RECORD_TYPE.REVENUE)
      return { provider }
    },
    template: `<div id="tagType">{{ provider.userTagType }}</div>`,
  })

  const wrapper = mountComponent({
    mountingOptions: {
      global: {
        stubs: { Heading: HeadingStub },
      },
    },
  })
  const tagType = wrapper.get('#tagType')
  expect(tagType.text()).toBe(FINANCE_RECORD_TYPE.REVENUE)
})

describe('after successfully fetching user tags', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()
    await flushPromises()
  })

  test('does not render a loader', () => {
    const loader = wrapper.findComponent(Loader)
    expect(loader.exists()).toBe(false)
  })

  test('renders the page content', () => {
    const wrapper = mountComponent()
    sharedAsserts.conditionallyRendersPageContent({ wrapper, shouldExist: true })
  })

  test('does not render an error', () => {
    const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.FETCH_TAGS_ERROR)
    expect(error).toBeUndefined()
  })
})

describe('with an error fetching user tags', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent({ queryUserTagsHandler: financeUserTagHandlers.getAllError() })
    await flushPromises()
  })

  test('does not render a loader', () => {
    const loader = wrapper.findComponent(Loader)
    expect(loader.exists()).toBe(false)
  })

  test('does not render the page content', () => {
    const wrapper = mountComponent()
    sharedAsserts.conditionallyRendersPageContent({ wrapper, shouldExist: false })
  })

  test('renders an error', () => {
    const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.FETCH_TAGS_ERROR)
    expect(error).toBeDefined()
  })
})
