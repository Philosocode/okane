// External
import { defineComponent } from 'vue'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

import { type HttpHandler } from 'msw'
import { type Router, useRouter } from 'vue-router'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'
import { useWatchFinanceQueryParams } from '@features/financeRecords/composables/useWatchFinanceQueryParams'

import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

import { createAppRouter } from '@shared/services/router/router'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { testServer } from '@tests/msw/testServer'

function getTestComponent() {
  return defineComponent({
    setup() {
      const router = useRouter()
      const { error, isLoading } = useWatchFinanceQueryParams()

      async function resetQuery() {
        await router.push({ query: {} })
      }

      return { error, isLoading, resetQuery }
    },
    template: `
      <div>
        <p id="error">{{ error }}</p>
        <p id="is-loading">{{ isLoading }}</p>
        <button @click="resetQuery" />
      </div>
    `,
  })
}

function mountComponent(
  args: {
    router?: Router
    userTagsHandler?: HttpHandler
  } = {},
) {
  testServer.use(args.userTagsHandler ?? financeUserTagHandlers.getAllSuccess({ userTags: [] }))

  return getMountComponent(getTestComponent(), {
    withPinia: true,
    withRouter: args.router ?? true,
    withQueryClient: true,
  })()
}

const sharedAsserts = {
  isLoading(wrapper: VueWrapper) {
    const loading = wrapper.get('#is-loading')
    expect(loading.text()).toBe('true')
  },
  isNotLoading(wrapper: VueWrapper) {
    const loading = wrapper.get('#is-loading')
    expect(loading.text()).toBe('false')
  },
}

test('initially sets isLoading to true', () => {
  const wrapper = mountComponent()
  sharedAsserts.isLoading(wrapper)
})

describe('after successfully querying user tags', () => {
  const userTags: Array<FinanceUserTag> = [createTestFinanceUserTag()]

  async function setUp() {
    const router = createAppRouter()
    await router.push({
      query: {
        tagIds: [userTags[0].tag.id],
      },
    })

    const wrapper = mountComponent({
      router,
      userTagsHandler: financeUserTagHandlers.getAllSuccess({ userTags }),
    })

    await flushPromises()

    return wrapper
  }

  test('updates search filters', async () => {
    const searchStore = useFinanceRecordSearchStore()
    await setUp()
    expect(searchStore.filters).toEqual({
      ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
      tags: [userTags[0].tag],
    })
  })

  test('stops loading', async () => {
    const wrapper = await setUp()
    sharedAsserts.isNotLoading(wrapper)
  })

  test('re-runs the effect when the query changes', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const wrapper = await setUp()

    const resetButton = wrapper.get('button')
    await resetButton.trigger('click')
    await flushPromises()

    expect(searchStore.filters).toEqual({ ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS })
  })
})

describe('with an error querying user tags', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent({ userTagsHandler: financeUserTagHandlers.getAllError() })
    await flushPromises()
  })

  test('returns an error', () => {
    const error = wrapper.find('#error')
    expect(error.text()).not.toBe('')
  })

  test('stops loading', () => {
    sharedAsserts.isNotLoading(wrapper)
  })
})
