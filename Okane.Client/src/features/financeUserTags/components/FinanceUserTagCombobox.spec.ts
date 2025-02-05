// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http, HttpHandler, HttpResponse } from 'msw'

// Internal
import FinanceUserTagCombobox, {
  type FinanceUserTagComboboxProps,
} from '@features/financeUserTags/components/FinanceUserTagCombobox.vue'

import { financeUserTagAPIRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { HTML_ROLE } from '@shared/constants/html'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { SHARED_COPY } from '@shared/constants/copy'
import { TAG_COMBOBOX_DISABLED_CLASS, TAG_COMBOBOX_SPINNER_CLASS } from '@shared/constants/tags'

import { type Tag } from '@shared/types/tag'
import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { createTestTag } from '@tests/factories/tag'
import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { getMSWURL } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

const allUserTags: FinanceUserTag[] = [
  createTestFinanceUserTag({
    id: 11,
    tag: createTestTag({ id: 1, name: '1' }),
    type: FINANCE_RECORD_TYPE.EXPENSE,
  }),
  createTestFinanceUserTag({
    id: 22,
    tag: createTestTag({ id: 2, name: '2' }),
    type: FINANCE_RECORD_TYPE.EXPENSE,
  }),
  createTestFinanceUserTag({
    id: 33,
    tag: createTestTag({ id: 3, name: '3' }),
    type: FINANCE_RECORD_TYPE.EXPENSE,
  }),

  createTestFinanceUserTag({
    id: 44,
    tag: createTestTag({ id: 3, name: '3' }),
    type: FINANCE_RECORD_TYPE.REVENUE,
  }),
  createTestFinanceUserTag({
    id: 55,
    tag: createTestTag({ id: 4, name: '4' }),
    type: FINANCE_RECORD_TYPE.REVENUE,
  }),
  createTestFinanceUserTag({
    id: 66,
    tag: createTestTag({ id: 5, name: '5' }),
    type: FINANCE_RECORD_TYPE.REVENUE,
  }),
]

const getFinanceUserTagsSuccess = financeUserTagHandlers.getAllSuccess({ userTags: allUserTags })

const createdTagId = 1234
const createFinanceUserTagSuccess = financeUserTagHandlers.postSuccess({ createdTagId })

const defaultProps: FinanceUserTagComboboxProps = {
  createdTagType: undefined,
  id: 'cool-combobox',
  selectedTags: [],
  tagTypes: [FINANCE_RECORD_TYPE.EXPENSE],
}

async function mountComponent(args: {
  props?: FinanceUserTagComboboxProps
  createFinanceUserTagHandler?: HttpHandler
  queryFinanceUserTagsHandler?: HttpHandler
  shouldFlushPromises?: boolean
}) {
  testServer.use(args.createFinanceUserTagHandler ?? createFinanceUserTagSuccess)
  testServer.use(args.queryFinanceUserTagsHandler ?? getFinanceUserTagsSuccess)

  const wrapper = getMountComponent(FinanceUserTagCombobox, {
    props: args.props ?? defaultProps,
    withQueryClient: true,
  })()

  const shouldFlushPromises = args.shouldFlushPromises ?? true

  if (shouldFlushPromises) await flushPromises()

  return wrapper
}

const elements = {
  combobox(wrapper: VueWrapper) {
    return wrapper.find(`input[role=${HTML_ROLE.COMBOBOX}]`)
  },
  tagOption(wrapper: VueWrapper, tagName: string) {
    return wrapper.find(`li[aria-label="${tagName}"]`)
  },
}

test('renders a combobox with an ID', async () => {
  const wrapper = await mountComponent({ props: defaultProps })
  const combobox = elements.combobox(wrapper)
  expect(combobox.attributes('id')).toBe(defaultProps.id)
})

test('does not render a query error', async () => {
  const wrapper = await mountComponent({ props: defaultProps })
  expect(wrapper.findByText('p', FINANCE_USER_TAGS_COPY.COMBOBOX.FETCH_ERROR)).toBeUndefined()
})

test('does not render a create error', async () => {
  const wrapper = await mountComponent({ props: defaultProps })
  expect(wrapper.findByText('p', FINANCE_USER_TAGS_COPY.COMBOBOX.CREATE_ERROR)).toBeUndefined()
})

test('renders only expense tag options', async () => {
  const wrapper = await mountComponent({
    props: {
      ...defaultProps,
      tagTypes: [FINANCE_RECORD_TYPE.EXPENSE],
    },
  })

  const expenseUserTags = allUserTags.filter(
    (userTag) => userTag.type === FINANCE_RECORD_TYPE.EXPENSE,
  )
  expenseUserTags.forEach((userTag) => {
    expect(elements.tagOption(wrapper, userTag.tag.name).exists()).toBe(true)
  })

  const revenueUserTags = allUserTags.filter(
    (userTag) =>
      userTag.type === FINANCE_RECORD_TYPE.REVENUE &&
      !expenseUserTags.some((expenseUserTag) => expenseUserTag.tag.id === userTag.tag.id),
  )
  revenueUserTags.forEach((userTag) => {
    expect(elements.tagOption(wrapper, userTag.tag.name).exists()).toBe(false)
  })
})

test('renders only revenue tag options', async () => {
  const wrapper = await mountComponent({
    props: {
      ...defaultProps,
      tagTypes: [FINANCE_RECORD_TYPE.REVENUE],
    },
  })

  const revenueUserTags = allUserTags.filter(
    (userTag) => userTag.type === FINANCE_RECORD_TYPE.REVENUE,
  )
  revenueUserTags.forEach((userTag) => {
    expect(elements.tagOption(wrapper, userTag.tag.name).exists()).toBe(true)
  })

  const expenseUserTags = allUserTags.filter(
    (userTag) =>
      userTag.type === FINANCE_RECORD_TYPE.EXPENSE &&
      !revenueUserTags.some((revenueUserTag) => revenueUserTag.tag.id === userTag.tag.id),
  )
  expenseUserTags.forEach((userTag) => {
    expect(elements.tagOption(wrapper, userTag.tag.name).exists()).toBe(false)
  })
})

test('renders unique expense & revenue tag options', async () => {
  const wrapper = await mountComponent({
    props: {
      ...defaultProps,
      tagTypes: [FINANCE_RECORD_TYPE.EXPENSE, FINANCE_RECORD_TYPE.REVENUE],
    },
  })

  const uniqueTagIds = new Set<number>()
  const uniqueTags: Tag[] = []
  allUserTags.forEach((userTag) => {
    if (uniqueTagIds.has(userTag.tag.id)) return
    uniqueTags.push(userTag.tag)
    uniqueTagIds.add(userTag.tag.id)
  })

  uniqueTags.forEach((tag) => {
    expect(wrapper.findAll(`li[aria-label='${tag.name}']`).length).toBe(1)
  })
})

test('does not allow tag creation', async () => {
  const wrapper = await mountComponent({ props: defaultProps })
  const combobox = elements.combobox(wrapper)
  await combobox.setValue('random-text')

  const noMatchText = wrapper.findByText('div', SHARED_COPY.TAG_COMBOBOX.NO_RESULTS)
  expect(noMatchText).toBeDefined()
})

test('does not disable the combobox', async () => {
  const wrapper = await mountComponent({ props: defaultProps })
  expect(wrapper.find(`div.${TAG_COMBOBOX_DISABLED_CLASS}`).exists()).toBe(false)
})

test('does not render a spinner', async () => {
  const wrapper = await mountComponent({ props: defaultProps })
  expect(wrapper.find(`span.${TAG_COMBOBOX_SPINNER_CLASS}`).exists()).toBe(false)
})

test('renders a spinner while fetching finance user tags', async () => {
  const wrapper = await mountComponent({
    props: defaultProps,
    shouldFlushPromises: false,
  })
  expect(wrapper.find(`span.${TAG_COMBOBOX_SPINNER_CLASS}`).exists()).toBe(true)
})

test('emits a "change" event when selecting a tag', async () => {
  const wrapper = await mountComponent({ props: defaultProps })
  const tagOption = elements.tagOption(wrapper, allUserTags[0].tag.name)

  expect(wrapper.emitted('change')).toBeUndefined()

  await tagOption.trigger('click')

  const emitted = wrapper.emitted<Tag[][]>('change')
  const emittedTags = emitted?.[0][0]
  expect(emittedTags).toHaveLength(1)
  expect(emittedTags?.[0].name).toBe(allUserTags[0].tag.name)
})

async function selectNewTag(args: { wrapper: VueWrapper; newTagName: string }) {
  const combobox = elements.combobox(args.wrapper)
  await combobox.setValue(args.newTagName)

  const tagOption = elements.tagOption(args.wrapper, args.newTagName)
  await tagOption.trigger('click')
}

describe('when successfully creating a new tag', () => {
  const newTagName = 'sir-doggo-tag'
  const props = {
    ...defaultProps,
    createdTagType: FINANCE_RECORD_TYPE.EXPENSE,
  }

  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent({ props })
    await selectNewTag({ newTagName, wrapper })
  })

  test('emits a "createTag" event', async () => {
    await flushPromises()

    const emitted = wrapper.emitted<Tag[][]>('createTag')
    expect(emitted?.[0][0]).toEqual({
      id: expect.any(Number),
      name: newTagName,
    })
  })

  test('renders a spinner while creating the tag', () => {
    expect(wrapper.find(`span.${TAG_COMBOBOX_SPINNER_CLASS}`).exists()).toBe(true)
  })
})

describe('with an error creating a tag', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const errorHandler = http.post(getMSWURL(financeUserTagAPIRoutes.post()), () =>
      HttpResponse.json(createTestProblemDetails(), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      }),
    )

    wrapper = await mountComponent({
      props: {
        ...defaultProps,
        createdTagType: FINANCE_RECORD_TYPE.EXPENSE,
      },
      createFinanceUserTagHandler: errorHandler,
    })
    await selectNewTag({ newTagName: 'cool-new-tag', wrapper })
    await flushPromises()
  })

  test('renders a create error', () => {
    const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.COMBOBOX.CREATE_ERROR)
    expect(error).toBeDefined()
  })

  test('does not render a fetch error', () => {
    const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.COMBOBOX.FETCH_ERROR)
    expect(error).toBeUndefined()
  })

  test('disables the combobox', () => {
    expect(wrapper.find(`div.${TAG_COMBOBOX_DISABLED_CLASS}`).exists()).toBe(true)
  })
})

describe('with an error fetching finance user tags', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent({
      props: defaultProps,
      queryFinanceUserTagsHandler: financeUserTagHandlers.getAllError(),
    })
  })

  test('renders a fetch error', () => {
    const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.COMBOBOX.FETCH_ERROR)
    expect(error).toBeDefined()
  })

  test('does not render a create error', () => {
    const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.COMBOBOX.CREATE_ERROR)
    expect(error).toBeUndefined()
  })

  test('disables the combobox', () => {
    expect(wrapper.find(`div.${TAG_COMBOBOX_DISABLED_CLASS}`).exists()).toBe(true)
  })
})
