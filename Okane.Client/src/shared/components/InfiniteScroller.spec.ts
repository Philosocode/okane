// External
import { flushPromises } from '@vue/test-utils'
import { computed, defineComponent } from 'vue'
import { http, HttpResponse } from 'msw'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/financeRecordList/FinanceRecordListItem.vue'
import InfiniteScroller from '@shared/components/InfiniteScroller.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { DEFAULT_PAGE_SIZE } from '@shared/constants/request'
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'

import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { flattenPages } from '@shared/utils/pagination'
import { getRange } from '@shared/utils/array'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { getMswUrl } from '@tests/utils/url'
import { setUpIntersectionObserverMock } from '@tests/mocks/intersectionObserver'
import { testServer } from '@tests/msw/testServer'
import { withSearchParams } from '@tests/msw/resolvers/withSearchParams'
import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'

const testIds = {
  defaultSlot: 'defaultSlot',
  errorSlot: 'errorSlot',
  loader: 'loader',
  loadMoreButton: 'loadMoreButton',
  noItemsSlot: 'noItemsSlot',
  noMoreItemsSlot: 'noMoreItemsSlot',
}

const searchFilters = DEFAULT_FINANCE_RECORD_SEARCH_FILTERS

function getTestComponent(errorTemplate?: string) {
  return defineComponent({
    components: { FinanceRecordListItem, InfiniteScroller },
    setup() {
      const queryResult = useInfiniteQueryFinanceRecords()
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
        
        <template #noMoreItems>
          <div data-testid="${testIds.noMoreItemsSlot}" />
        </template>
      </InfiniteScroller>
    `,
  })
}

const FinanceRecordListItemStub = defineComponent({
  props: {
    financeRecord: Object,
  },
  template: `<div>{{ $props.financeRecord.description }}</div>`,
})

const ObserverStub = defineComponent({
  template: `<button data-testid="${testIds.loadMoreButton}" @click="$emit('change', true)" />`,
})

function mountComponent(errorTemplate?: string) {
  return getMountComponent(getTestComponent(errorTemplate), {
    global: {
      stubs: {
        FinanceRecordListItem: FinanceRecordListItemStub,
        Loader: {
          template: `<div data-testid="${testIds.loader}" />`,
        },
        Observer: ObserverStub,
      },
    },
    withQueryClient: true,
  })()
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', setUpIntersectionObserverMock({ isIntersecting: true }))
})

afterAll(() => {
  vi.unstubAllGlobals()
})

const financeRecords = getRange({ end: DEFAULT_PAGE_SIZE * 2 + 1 }).map((i) =>
  createTestFinanceRecord({ id: i }),
)

test('renders a loader while fetching items', () => {
  testServer.use(
    financeRecordHandlers.getPaginatedFinanceRecordsSuccess({
      financeRecords,
      searchFilters,
    }),
  )

  const wrapper = mountComponent()
  const loader = wrapper.find(`div[data-testid="${testIds.loader}"]`)
  expect(loader.exists()).toBe(true)
})

test('renders the default slot when the response contains items', async () => {
  testServer.use(
    financeRecordHandlers.getPaginatedFinanceRecordsSuccess({
      financeRecords,
      searchFilters,
    }),
  )

  const wrapper = mountComponent()

  await flushPromises()

  const defaultSlot = wrapper.find(`[data-testid="${testIds.defaultSlot}"]`)
  expect(defaultSlot.exists()).toBe(true)
})

describe('when there is no next page', () => {
  beforeEach(() => {
    testServer.use(
      financeRecordHandlers.getPaginatedFinanceRecordsSuccess({
        financeRecords,
        hasNextPage: false,
        searchFilters,
      }),
    )
  })

  test('renders the noMoreItems slot', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const noMoreItemsSlot = wrapper.find(`[data-testid="${testIds.noMoreItemsSlot}"]`)
    expect(noMoreItemsSlot.exists()).toBe(true)
  })

  test('does not render the noItems slot', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const noItemsSlot = wrapper.find(`[data-testid="${testIds.noItemsSlot}"]`)
    expect(noItemsSlot.exists()).toBe(false)
  })
})

describe('when the response contains no items', () => {
  beforeEach(() => {
    testServer.use(
      financeRecordHandlers.getPaginatedFinanceRecordsSuccess({
        financeRecords: [],
        searchFilters,
      }),
    )
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

  test('does not render noMoreItems slot', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const noMoreItems = wrapper.find(`[data-testid="${testIds.noMoreItemsSlot}"]`)
    expect(noMoreItems.exists()).toBe(false)
  })
})

describe('when the response contains an error', () => {
  const errorMessage = 'An error occurred.'

  beforeEach(() => {
    testServer.use(financeRecordHandlers.getPaginatedFinanceRecordsError({ detail: errorMessage }))
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
  const page1FinanceRecord = createTestFinanceRecord({
    id: 1,
    description: 'page1FinanceRecord',
  })
  const page2FinanceRecord = createTestFinanceRecord({
    id: 2,
    description: 'page2FinanceRecord',
  })
  const page3FinanceRecord = createTestFinanceRecord({
    id: 3,
    description: 'page3FinanceRecord',
  })

  beforeEach(() => {
    const apiRoute = getMswUrl(
      financeRecordApiRoutes.getPaginatedList({
        cursor: {},
        searchFilters,
      }),
    )

    testServer.use(
      http.get(
        apiRoute,
        withSearchParams(
          (searchParams) => !searchParams.has('cursorId'),
          () => {
            return HttpResponse.json(
              wrapInApiPaginatedResponse(wrapInApiResponse([page1FinanceRecord])),
            )
          },
        ),
      ),
      http.get(
        apiRoute,
        withSearchParams(
          (searchParams) => searchParams.get('cursorId') === page1FinanceRecord.id.toString(),
          () => {
            return HttpResponse.json(
              wrapInApiPaginatedResponse(wrapInApiResponse([page2FinanceRecord])),
            )
          },
        ),
      ),
      http.get(
        apiRoute,
        withSearchParams(
          (searchParams) => {
            return searchParams.get('cursorId') === page2FinanceRecord.id.toString()
          },
          () => {
            return HttpResponse.json(
              wrapInApiPaginatedResponse(wrapInApiResponse([page3FinanceRecord]), {
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

    const page1FinanceRecordDescription = wrapper.findByText('div', page1FinanceRecord.description)
    let page2FinanceRecordDescription = wrapper.findByText('div', page2FinanceRecord.description)
    let page3FinanceRecordDescription = wrapper.findByText('div', page3FinanceRecord.description)

    expect(page1FinanceRecordDescription).toBeDefined()
    expect(page2FinanceRecordDescription).toBeUndefined()
    expect(page3FinanceRecordDescription).toBeUndefined()

    let loadMoreButton = wrapper.get(`button[data-testid="${testIds.loadMoreButton}"]`)
    await loadMoreButton.trigger('click')
    await flushPromises()

    page2FinanceRecordDescription = wrapper.findByText('div', page2FinanceRecord.description)
    page3FinanceRecordDescription = wrapper.findByText('div', page3FinanceRecord.description)

    expect(page2FinanceRecordDescription).toBeDefined()
    expect(page3FinanceRecordDescription).toBeUndefined()

    loadMoreButton = wrapper.get(`button[data-testid="${testIds.loadMoreButton}"]`)
    await loadMoreButton.trigger('click')
    await flushPromises()

    page3FinanceRecordDescription = wrapper.findByText('div', page3FinanceRecord.description)
    expect(page3FinanceRecordDescription).toBeDefined()
  })
})
