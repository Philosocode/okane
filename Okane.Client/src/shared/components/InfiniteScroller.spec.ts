// External
import { flushPromises } from '@vue/test-utils'
import { computed, defineComponent, toRef } from 'vue'
import { http, HttpResponse } from 'msw'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import InfiniteScroller from '@shared/components/InfiniteScroller.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { DEFAULT_PAGE_SIZE } from '@shared/constants/request'
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'
import { FINANCE_RECORD_HANDLER_FACTORY } from '@tests/msw/handlers/financeRecord'

import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { flattenPages } from '@shared/utils/pagination'
import { getRange } from '@shared/utils/array'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { setUpIntersectionObserverMock } from '@tests/mocks/intersectionObserver'
import { testServer } from '@tests/msw/testServer'
import { withSearchParams } from '@tests/msw/resolvers/withSearchParams'

const testIds = {
  defaultSlot: 'defaultSlot',
  errorSlot: 'errorSlot',
  loader: 'loader',
  loadMoreButton: 'loadMoreButton',
  noItemsSlot: 'noItemsSlot',
}

function getTestComponent(errorTemplate?: string) {
  return defineComponent({
    components: { FinanceRecordListItem, InfiniteScroller },
    setup() {
      const queryResult = useInfiniteQueryFinanceRecords(
        toRef(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS),
      )
      const items = computed(() => flattenPages(queryResult?.data?.value?.pages ?? []))

      return { queryResult, items }
    },
    template: `
      <InfiniteScroller :items="items" :query-result="queryResult">
        <div data-testid="${testIds.defaultSlot}" />
        
        <div v-for="item in items">
          <FinanceRecordListItem :key="item.id" :finance-record="item" />
        </div>
        
        <template #noItems>
          <div data-testid="${testIds.noItemsSlot}" />
        </template>
        
        ${errorTemplate && `<template #error>${errorTemplate}</template>`}
      </InfiniteScroller>
    `,
  })
}

const ObserverStub = defineComponent({
  template: `<button data-testid="${testIds.loadMoreButton}" @click="$emit('change', true)" />`,
})

function mountComponent(errorTemplate?: string) {
  return getMountComponent(getTestComponent(errorTemplate), {
    global: {
      stubs: {
        Loader: {
          template: `<div data-testid="${testIds.loader}" />`,
        },
        Observer: ObserverStub,
      },
    },
    withQueryClient: true,
  })()
}

const financeRecords = getRange({ end: DEFAULT_PAGE_SIZE * 2 + 1 }).map((_) =>
  createTestFinanceRecord({}),
)

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', setUpIntersectionObserverMock({ isIntersecting: true }))
})

afterAll(() => {
  vi.unstubAllGlobals()
})

test('renders a loader while fetching items', async () => {
  testServer.use(
    FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_SUCCESS(financeRecords),
  )

  const wrapper = mountComponent()
  const loader = wrapper.find(`div[data-testid="${testIds.loader}"]`)
  expect(loader.exists()).toBe(true)
})

test('renders the default slot when the response contains items', async () => {
  testServer.use(
    FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_SUCCESS(financeRecords),
  )

  const wrapper = mountComponent()

  await flushPromises()

  const defaultSlot = wrapper.find(`[data-testid="${testIds.defaultSlot}"]`)
  expect(defaultSlot.exists()).toBe(true)
})

describe('when the response contains no items', () => {
  beforeEach(() => {
    testServer.use(FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_SUCCESS([]))
  })

  test('renders the noItems slot', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const noItemsSlot = wrapper.find(`[data-testid="${testIds.noItemsSlot}"]`)
    expect(noItemsSlot.exists()).toBe(true)
  })

  test('does not render the default slot', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const defaultSlot = wrapper.find(`[data-testid="${testIds.defaultSlot}"]`)
    expect(defaultSlot.exists()).toBe(false)
  })
})

describe('when the response contains an error', () => {
  const errorMessage = 'An error occurred.'

  beforeEach(() => {
    testServer.use(FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_ERROR(errorMessage))
  })

  test('renders the queryResult error with the default error slot content', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const error = wrapper.findByText('p', errorMessage)
    expect(error.exists()).toBe(true)
  })

  test('does not render the queryResult error when content is passed to the error slot', async () => {
    const otherErrorMessage = 'A different error occurred.'
    const wrapper = mountComponent(`<div>${otherErrorMessage}</div>`)

    await flushPromises()

    const queryError = wrapper.findByText('p', errorMessage)
    expect(queryError).toBeUndefined()

    const otherError = wrapper.findByText('div', otherErrorMessage)
    expect(otherError.exists()).toBe(true)
  })
})

describe(`when there are more pages to fetch page`, () => {
  const page2FinanceRecord = createTestFinanceRecord({ description: 'page2FinanceRecord' })
  const page3FinanceRecord = createTestFinanceRecord({ description: 'page3FinanceRecord' })

  beforeEach(() => {
    const apiRoute = `/api${FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.basePath}`

    testServer.use(
      http.get(
        apiRoute,
        withSearchParams(
          (searchParams) => searchParams.get('page') === '1',
          () => {
            return HttpResponse.json(wrapInAPIPaginatedResponse(wrapInAPIResponse(financeRecords)))
          },
        ),
      ),
      http.get(
        apiRoute,
        withSearchParams(
          (searchParams) => {
            return searchParams.get('page') === '2'
          },
          () => {
            return HttpResponse.json(
              wrapInAPIPaginatedResponse(wrapInAPIResponse([page2FinanceRecord])),
            )
          },
        ),
      ),
      http.get(
        apiRoute,
        withSearchParams(
          (searchParams) => searchParams.get('page') === '3',
          () => {
            return HttpResponse.json(
              wrapInAPIPaginatedResponse(wrapInAPIResponse([page3FinanceRecord]), {
                hasNextPage: false,
              }),
            )
          },
        ),
      ),
    )
  })

  test('renders a loader when fetching subsequent pages', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const loadMoreButton = wrapper.get(`button[data-testid="${testIds.loadMoreButton}"]`)

    await loadMoreButton.trigger('click')

    const loader = wrapper.find(`[data-testid="${testIds.loader}"]`)
    expect(loader.exists()).toBe(true)
  })

  test(`fetches subsequent pages while there's a next page`, async () => {
    const wrapper = mountComponent()

    await flushPromises()

    let page2FinanceRecordDescription = wrapper.findByText('div', page2FinanceRecord.description)
    let page3FinanceRecordDescription = wrapper.findByText('div', page3FinanceRecord.description)

    expect(page2FinanceRecordDescription).toBeUndefined()
    expect(page3FinanceRecordDescription).toBeUndefined()

    let loadMoreButton = wrapper.get(`button[data-testid="${testIds.loadMoreButton}"]`)

    await loadMoreButton.trigger('click')
    await flushPromises()

    page2FinanceRecordDescription = wrapper.findByText('div', page2FinanceRecord.description)
    page3FinanceRecordDescription = wrapper.findByText('div', page3FinanceRecord.description)

    expect(page2FinanceRecordDescription.exists()).toBe(true)
    expect(page3FinanceRecordDescription).toBeUndefined()

    loadMoreButton = wrapper.get(`button[data-testid="${testIds.loadMoreButton}"]`)
    await loadMoreButton.trigger('click')
    await flushPromises()

    page2FinanceRecordDescription = wrapper.findByText('div', page2FinanceRecord.description)
    page3FinanceRecordDescription = wrapper.findByText('div', page3FinanceRecord.description)

    expect(page2FinanceRecordDescription.exists()).toBe(true)
    expect(page3FinanceRecordDescription.exists()).toBe(true)
  })
})