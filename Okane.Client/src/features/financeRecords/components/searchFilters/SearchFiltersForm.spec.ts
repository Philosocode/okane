// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import FinanceRecordAmountFilter from '@features/financeRecords/components/searchFilters/FinanceRecordAmountFilter.vue'
import FinanceRecordHappenedAtFilter from '@features/financeRecords/components/searchFilters/FinanceRecordHappenedAtFilter.vue'
import SearchFiltersForm from '@features/financeRecords/components/searchFilters/SearchFiltersForm.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { INPUT_TYPE } from '@shared/constants/form'
import { SHARED_COPY } from '@shared/constants/copy'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SORT_FIELD_OPTIONS,
  SEARCH_FINANCE_RECORDS_TYPE_OPTIONS,
} from '@features/financeRecords/constants/searchFilters'
import {
  COMPARISON_OPERATOR,
  SORT_DIRECTION,
  SORT_DIRECTION_OPTIONS,
} from '@shared/constants/search'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type FinanceUserTagMap } from '@features/financeUserTags/types/financeUserTag'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

import { mapDateOnlyTimestampToLocalizedDate } from '@shared/utils/dateTime'
import {
  mapFinanceRecordSearchFilters,
  mapFinanceRecordSearchFiltersFormState,
} from '@features/financeRecords/utils/mappers'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { createTestTag } from '@tests/factories/tag'
import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { testServer } from '@tests/msw/testServer'

const userTagMap: FinanceUserTagMap = {
  Expense: [
    createTestFinanceUserTag({
      id: 1,
      tag: createTestTag({ id: 1, name: '1' }),
      type: FINANCE_RECORD_TYPE.EXPENSE,
    }),
  ],
  Revenue: [
    createTestFinanceUserTag({
      id: 2,
      tag: createTestTag({ id: 2, name: '2' }),
      type: FINANCE_RECORD_TYPE.REVENUE,
    }),
  ],
}

const userTags = [...userTagMap.Expense, ...userTagMap.Revenue]

async function mountWithHandler() {
  testServer.use(financeUserTagHandlers.getAllSuccess({ userTags }))

  const wrapper = getMountComponent(SearchFiltersForm, {
    attachTo: document.body,
    withPinia: true,
    withQueryClient: true,
  })()

  await flushPromises()

  return wrapper
}

const helpers = {
  async submitForm(wrapper: VueWrapper) {
    const submitButton = wrapper.get(`button[type="submit"]`)
    await submitButton.trigger('submit')
  },
}

describe('Description input', () => {
  test('renders an input with the expected properties and label', async () => {
    const wrapper = await mountWithHandler()
    const input = wrapper.get('input[name="description"]')
    expect(input.attributes('type')).toBe(INPUT_TYPE.TEXT)

    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.DESCRIPTION)
    expect(label).toBeDefined()
  })

  test('updates the search filters description state', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const wrapper = await mountWithHandler()
    const input = wrapper.get('input[name="description"]')
    const description = 'Test description'

    await input.setValue(description)
    await helpers.submitForm(wrapper)

    expect(searchStore.filters.description).toBe(description)
  })

  test('focuses the input on mount', async () => {
    const wrapper = await mountWithHandler()
    const input = wrapper.get('input[name="description"]')
    expect(input.element).toBe(document.activeElement)
  })
})

describe('Type select', () => {
  test('renders a select and label', async () => {
    const wrapper = await mountWithHandler()
    const select = wrapper.find('select[name="type"]')
    expect(select.exists()).toBe(true)

    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.TYPE)
    expect(label).toBeDefined()
  })

  test('renders the expected select options', async () => {
    const wrapper = await mountWithHandler()

    commonAsserts.rendersExpectedSelectOptions({
      expectedOptions: SEARCH_FINANCE_RECORDS_TYPE_OPTIONS,
      select: wrapper.find('select[name="type"]'),
    })
  })

  test('updates the search filters type state and resets the tags', async () => {
    const searchStore = useFinanceRecordSearchStore()
    searchStore.setFilters({ tags: [userTags[0].tag] })

    const wrapper = await mountWithHandler()
    const input = wrapper.get('select[name="type"]')

    await input.setValue(FINANCE_RECORD_TYPE.REVENUE)
    await helpers.submitForm(wrapper)

    expect(searchStore.filters.type).toBe(FINANCE_RECORD_TYPE.REVENUE)
    expect(searchStore.filters.tags).toEqual([])
  })
})

describe('Amount filter', () => {
  test('renders an amount filter', async () => {
    const wrapper = await mountWithHandler()
    const amountFilter = wrapper.findComponent(FinanceRecordAmountFilter)
    expect(amountFilter.exists()).toBe(true)
  })

  test('updates the search filters amount state', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const wrapper = await mountWithHandler()
    const amountFilter = wrapper.findComponent(FinanceRecordAmountFilter)
    const changes = {
      amount1: '1',
      amount2: '2',
      amountOperator: COMPARISON_OPERATOR.LTE,
    }

    amountFilter.vm.$emit('change', changes)
    await helpers.submitForm(wrapper)

    expect(searchStore.filters).toEqual(
      expect.objectContaining({
        amount1: parseFloat(changes.amount1),
        amount2: parseFloat(changes.amount2),
        amountOperator: changes.amountOperator,
      }),
    )
  })
})

describe('Happened at filter', () => {
  test('renders a happened at filter', async () => {
    const wrapper = await mountWithHandler()
    const happenedAtFilter = wrapper.findComponent(FinanceRecordHappenedAtFilter)
    expect(happenedAtFilter.exists()).toBe(true)
  })

  test('updates the search filters happenedAt state', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const wrapper = await mountWithHandler()
    const amountFilter = wrapper.findComponent(FinanceRecordAmountFilter)
    const changes = {
      happenedAt1: '2024-01-01',
      happenedAt2: '2024-01-01',
      happenedAtOperator: COMPARISON_OPERATOR.LTE,
    }

    amountFilter.vm.$emit('change', changes)
    await helpers.submitForm(wrapper)

    expect(searchStore.filters).toEqual(
      expect.objectContaining({
        happenedAt1: mapDateOnlyTimestampToLocalizedDate(changes.happenedAt1),
        happenedAt2: mapDateOnlyTimestampToLocalizedDate(changes.happenedAt2),
        happenedAtOperator: COMPARISON_OPERATOR.LTE,
      }),
    )
  })
})

describe('Sort by select', () => {
  test('renders a select and label', async () => {
    const wrapper = await mountWithHandler()
    const select = wrapper.find('select[name="sortBy"]')
    expect(select.exists()).toBe(true)

    const label = wrapper.findByText('label', SHARED_COPY.SEARCH.SORT_BY)
    expect(label).toBeDefined()
  })

  test('renders the expected select options', async () => {
    const wrapper = await mountWithHandler()

    commonAsserts.rendersExpectedSelectOptions({
      expectedOptions: FINANCE_RECORD_SORT_FIELD_OPTIONS,
      select: wrapper.find('select[name="sortBy"]'),
    })
  })

  test('updates the search filters sort field state', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const wrapper = await mountWithHandler()
    const input = wrapper.get('select[name="sortBy"]')

    await input.setValue(FINANCE_RECORD_SORT_FIELD_OPTIONS[0].value)
    await helpers.submitForm(wrapper)

    expect(searchStore.filters.sortField).toBe(FINANCE_RECORD_SORT_FIELD_OPTIONS[0].value)
  })
})

describe('Sort direction select', () => {
  test('renders a select and label', async () => {
    const wrapper = await mountWithHandler()
    const select = wrapper.find('select[name="sortDirection"]')
    expect(select.exists()).toBe(true)

    const label = wrapper.findByText('label', SHARED_COPY.SEARCH.SORT_DIRECTION)
    expect(label).toBeDefined()
  })

  test('renders the expected select options', async () => {
    const wrapper = await mountWithHandler()

    commonAsserts.rendersExpectedSelectOptions({
      expectedOptions: SORT_DIRECTION_OPTIONS,
      select: wrapper.find('select[name="sortDirection"]'),
    })
  })

  test('updates the search filters sort direction state', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const wrapper = await mountWithHandler()
    const input = wrapper.get('select[name="sortDirection"]')

    await input.setValue(SORT_DIRECTION.ASCENDING)
    await helpers.submitForm(wrapper)

    expect(searchStore.filters.sortDirection).toBe(SORT_DIRECTION.ASCENDING)
  })
})

describe('Tag combobox', () => {
  function getTagOption(wrapper: VueWrapper, tagName: string) {
    return wrapper.find(`li[aria-label="${tagName}"]`)
  }

  test('renders all tag options when type not set', async () => {
    const wrapper = await mountWithHandler()

    userTags.forEach((userTag) => {
      expect(getTagOption(wrapper, userTag.tag.name).exists()).toBe(true)
    })
  })

  test(`renders expense tag options when type is set to ${FINANCE_RECORD_TYPE.EXPENSE}`, async () => {
    const searchStore = useFinanceRecordSearchStore()
    searchStore.setFilters({ type: FINANCE_RECORD_TYPE.EXPENSE })
    const wrapper = await mountWithHandler()

    userTagMap.Expense.forEach((userTag) => {
      expect(getTagOption(wrapper, userTag.tag.name).exists()).toBe(true)
    })

    userTagMap.Revenue.forEach((userTag) => {
      expect(getTagOption(wrapper, userTag.tag.name).exists()).toBe(false)
    })
  })

  test(`renders revenue tag options when type is set to ${FINANCE_RECORD_TYPE.REVENUE}`, async () => {
    const searchStore = useFinanceRecordSearchStore()
    searchStore.setFilters({ type: FINANCE_RECORD_TYPE.REVENUE })
    const wrapper = await mountWithHandler()

    userTagMap.Revenue.forEach((userTag) => {
      expect(getTagOption(wrapper, userTag.tag.name).exists()).toBe(true)
    })

    userTagMap.Expense.forEach((userTag) => {
      expect(getTagOption(wrapper, userTag.tag.name).exists()).toBe(false)
    })
  })

  test('updates the search filters tags state', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const wrapper = await mountWithHandler()
    const tagOption = getTagOption(wrapper, userTags[0].tag.name)
    await tagOption.trigger('click')
    await helpers.submitForm(wrapper)
    expect(searchStore.filters.tags).toEqual([userTags[0].tag])
  })
})

describe('Save button', () => {
  test('updates multiple search filters and closes the modal', async () => {
    const searchStore = useFinanceRecordSearchStore()
    searchStore.setModalIsShowing(true)

    const wrapper = await mountWithHandler()
    const updates = { description: 'Cool description', type: FINANCE_RECORD_TYPE.REVENUE }
    const descriptionInput = wrapper.get('input[name="description"]')
    await descriptionInput.setValue(updates.description)
    const typeSelect = wrapper.get('select[name="type"]')
    await typeSelect.setValue(updates.type)

    expect(searchStore.filters).toEqual(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)

    const saveButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.SAVE)
    await saveButton.trigger('submit')

    expect(searchStore.modalIsShowing).toBe(false)
    expect(searchStore.filters).toEqual(expect.objectContaining(updates))
  })

  test('does not update the search filters state when the form is invalid', async () => {
    const searchStore = useFinanceRecordSearchStore()
    const initialFilters: FinanceRecordSearchFilters = {
      ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,

      // When the amountOperator is empty, that means an amount range is showing and both inputs need
      // to be populated.
      amountOperator: undefined,
    }
    searchStore.setFilters(initialFilters)

    const initialFormState =
      mapFinanceRecordSearchFilters.to.financeRecordSearchFiltersFormState(initialFilters)

    const wrapper = await mountWithHandler()
    const updates = { amount1: '1', amount2: '2' }

    const amount1Input = wrapper.get('input[name="amount1"]')
    await amount1Input.setValue(updates.amount1)
    const saveButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.SAVE)
    await saveButton.trigger('submit')

    // Shouldn't update because an amount range is showing and amount2 is missing.
    expect(searchStore.filters).toEqual(initialFilters)

    const amount2Input = wrapper.get('input[name="amount2"]')
    await amount2Input.setValue(updates.amount2)
    await saveButton.trigger('submit')

    // Should update because amount1 and amount2 are both present.
    const expectedFilters = mapFinanceRecordSearchFiltersFormState.to.financeRecordSearchFilters({
      ...initialFormState,
      ...updates,
    })
    expect(searchStore.filters).toEqual(expectedFilters)
  })
})

describe('Cancel button', () => {
  test('closes the modal without saving changes', async () => {
    const searchStore = useFinanceRecordSearchStore()
    searchStore.setModalIsShowing(true)

    const wrapper = await mountWithHandler()
    const descriptionInput = wrapper.get('input[name="description"]')
    await descriptionInput.setValue('Cool')

    const cancelButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
    await cancelButton.trigger('click')

    expect(searchStore.modalIsShowing).toBe(false)
    expect(searchStore.filters).toEqual(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)
  })
})

describe('Reset button', () => {
  test('resets the form state', async () => {
    const initialSearchFilters = {
      ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
      description: 'Initial description',
    }
    const searchStore = useFinanceRecordSearchStore()
    searchStore.setFilters(initialSearchFilters)

    const wrapper = await mountWithHandler()
    const descriptionInput = wrapper.get('input[name="description"]')
    await descriptionInput.setValue('Updated description')

    const resetButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.RESET)
    await resetButton.trigger('click')

    const inputElement = descriptionInput.element as HTMLInputElement
    expect(inputElement.value).toBe('')

    expect(searchStore.filters).toEqual(initialSearchFilters)
  })
})
