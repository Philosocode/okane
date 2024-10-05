// External
import { VueWrapper } from '@vue/test-utils'

// Internal
import FinanceRecordAmountFilter from '@features/financeRecords/components/FinanceRecordAmountFilter.vue'
import FinanceRecordHappenedAtFilter from '@features/financeRecords/components/FinanceRecordHappenedAtFilter.vue'
import SearchFinanceRecordsForm from '@features/financeRecords/components/SearchFinanceRecordsForm.vue'

import {
  COMPARISON_OPERATOR,
  SORT_DIRECTION,
  SORT_DIRECTION_OPTIONS,
} from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { INPUT_TYPE } from '@shared/constants/form'
import { SHARED_COPY } from '@shared/constants/copy'
import {
  DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,
  FINANCE_RECORD_SORT_FIELD_OPTIONS,
  SEARCH_FINANCE_RECORDS_TYPE_OPTIONS,
} from '@features/financeRecords/constants/searchFinanceRecords'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

import { commonAsserts } from '@tests/utils/commonAsserts'

const mountComponent = getMountComponent(SearchFinanceRecordsForm)

const helpers = {
  async submitForm(wrapper: VueWrapper) {
    const submitButton = wrapper.get(`button[type="submit"]`)
    await submitButton.trigger('submit')
  },
}

describe('Description input', () => {
  test('renders an input with the expected properties and label', () => {
    const wrapper = mountComponent()
    const input = wrapper.get('input[name="description"]')
    expect(input.attributes('type')).toBe(INPUT_TYPE.TEXT)

    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.DESCRIPTION)
    expect(label).toBeDefined()
  })

  test('updates the search filters description state', async () => {
    const wrapper = mountComponent()
    const input = wrapper.get('input[name="description"]')
    const description = 'Test description'

    await input.setValue(description)
    await helpers.submitForm(wrapper)

    const searchStore = useSearchFinanceRecordsStore()
    expect(searchStore.searchFilters.description).toBe(description)
  })

  test('focuses the input on mount', async () => {
    const wrapper = mountComponent({ attachTo: document.body })
    const input = wrapper.get('input[name="description"]')
    expect(input.element).toBe(document.activeElement)
  })
})

describe('Type select', () => {
  test('renders a select and label', () => {
    const wrapper = mountComponent()
    const select = wrapper.find('select[name="type"]')
    expect(select.exists()).toBe(true)

    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.TYPE)
    expect(label).toBeDefined()
  })

  test('renders the expected select options', () => {
    const wrapper = mountComponent()

    commonAsserts.rendersExpectedSelectOptions({
      expectedOptions: SEARCH_FINANCE_RECORDS_TYPE_OPTIONS,
      select: wrapper.find('select[name="type"]'),
    })
  })

  test('updates the search filters type state', async () => {
    const wrapper = mountComponent()
    const input = wrapper.get('select[name="type"]')

    await input.setValue(FINANCE_RECORD_TYPE.REVENUE)
    await helpers.submitForm(wrapper)

    const searchStore = useSearchFinanceRecordsStore()
    expect(searchStore.searchFilters.type).toBe(FINANCE_RECORD_TYPE.REVENUE)
  })
})

describe('Amount filter', () => {
  test('renders an amount filter', () => {
    const wrapper = mountComponent()
    const amountFilter = wrapper.findComponent(FinanceRecordAmountFilter)
    expect(amountFilter.exists()).toBe(true)
  })

  test('updates the search filters amount state', async () => {
    const wrapper = mountComponent()
    const amountFilter = wrapper.findComponent(FinanceRecordAmountFilter)
    const changes: Partial<FinanceRecordsSearchFilters> = {
      amount1: 1,
      amount2: 2,
      amountOperator: COMPARISON_OPERATOR.LTE,
    }

    amountFilter.vm.$emit('change', changes)
    await helpers.submitForm(wrapper)

    const searchStore = useSearchFinanceRecordsStore()
    expect(searchStore.searchFilters).toEqual(expect.objectContaining(changes))
  })
})

describe('Happened at filter', () => {
  test('renders a happened at filter', () => {
    const wrapper = mountComponent()
    const happenedAtFilter = wrapper.findComponent(FinanceRecordHappenedAtFilter)
    expect(happenedAtFilter.exists()).toBe(true)
  })

  test('updates the search filters happenedAt state', async () => {
    const wrapper = mountComponent()
    const amountFilter = wrapper.findComponent(FinanceRecordAmountFilter)
    const changes: Partial<FinanceRecordsSearchFilters> = {
      happenedAt1: new Date(),
      happenedAt2: new Date(),
      happenedAtOperator: COMPARISON_OPERATOR.LTE,
    }

    amountFilter.vm.$emit('change', changes)
    await helpers.submitForm(wrapper)

    const searchStore = useSearchFinanceRecordsStore()
    expect(searchStore.searchFilters).toEqual(expect.objectContaining(changes))
  })
})

describe('Sort by select', () => {
  test('renders a select and label', () => {
    const wrapper = mountComponent()
    const select = wrapper.find('select[name="sortBy"]')
    expect(select.exists()).toBe(true)

    const label = wrapper.findByText('label', SHARED_COPY.SEARCH.SORT_BY)
    expect(label).toBeDefined()
  })

  test('renders the expected select options', () => {
    const wrapper = mountComponent()

    commonAsserts.rendersExpectedSelectOptions({
      expectedOptions: FINANCE_RECORD_SORT_FIELD_OPTIONS,
      select: wrapper.find('select[name="sortBy"]'),
    })
  })

  test('updates the search filters sort field state', async () => {
    const wrapper = mountComponent()
    const input = wrapper.get('select[name="sortBy"]')

    await input.setValue(FINANCE_RECORD_SORT_FIELD_OPTIONS[0].value)
    await helpers.submitForm(wrapper)

    const searchStore = useSearchFinanceRecordsStore()
    expect(searchStore.searchFilters.sortField).toBe(FINANCE_RECORD_SORT_FIELD_OPTIONS[0].value)
  })
})

describe('Sort direction select', () => {
  test('renders a select and label', () => {
    const wrapper = mountComponent()
    const select = wrapper.find('select[name="sortDirection"]')
    expect(select.exists()).toBe(true)

    const label = wrapper.findByText('label', SHARED_COPY.SEARCH.SORT_DIRECTION)
    expect(label).toBeDefined()
  })

  test('renders the expected select options', () => {
    const wrapper = mountComponent()

    commonAsserts.rendersExpectedSelectOptions({
      expectedOptions: SORT_DIRECTION_OPTIONS,
      select: wrapper.find('select[name="sortDirection"]'),
    })
  })

  test('updates the search filters sort direction state', async () => {
    const wrapper = mountComponent()
    const input = wrapper.get('select[name="sortDirection"]')

    await input.setValue(SORT_DIRECTION.ASCENDING)
    await helpers.submitForm(wrapper)

    const searchStore = useSearchFinanceRecordsStore()
    expect(searchStore.searchFilters.sortDirection).toBe(SORT_DIRECTION.ASCENDING)
  })
})

describe('Save button', () => {
  test('updates multiple search filters and closes the modal', async () => {
    const searchStore = useSearchFinanceRecordsStore()
    searchStore.setModalIsShowing(true)

    const wrapper = mountComponent()
    const updates = { description: 'Cool description', type: FINANCE_RECORD_TYPE.REVENUE }
    const descriptionInput = wrapper.get('input[name="description"]')
    await descriptionInput.setValue(updates.description)
    const typeSelect = wrapper.get('select[name="type"]')
    await typeSelect.setValue(updates.type)

    expect(searchStore.searchFilters).toEqual(DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS)

    const saveButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.SAVE)
    await saveButton.trigger('submit')

    expect(searchStore.modalIsShowing).toBe(false)
    expect(searchStore.searchFilters).toEqual(expect.objectContaining(updates))
  })

  test('does not update the search filters state when the form is invalid', async () => {
    const searchStore = useSearchFinanceRecordsStore()
    const initialSearchFilters = {
      ...DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,

      // When the amountOperator is empty, that means an amount range is showing and both inputs need
      // to be populated.
      amountOperator: undefined,
    }

    searchStore.searchFilters = initialSearchFilters

    const wrapper = mountComponent()
    const updates = { amount1: 1, amount2: 2 }

    const amount1Input = wrapper.get('input[name="amount1"]')
    await amount1Input.setValue(updates.amount1)
    const saveButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.SAVE)
    await saveButton.trigger('submit')

    // Shouldn't update because an amount range is showing and amount2 is missing.
    expect(searchStore.searchFilters).toEqual(initialSearchFilters)

    const amount2Input = wrapper.get('input[name="amount2"]')
    await amount2Input.setValue(updates.amount2)
    await saveButton.trigger('submit')

    // Should update because amount1 and amount2 are both present.
    expect(searchStore.searchFilters).toEqual({
      ...initialSearchFilters,
      ...updates,
    })
  })
})

describe('Cancel button', async () => {
  test('closes the modal without saving changes', async () => {
    const searchStore = useSearchFinanceRecordsStore()
    searchStore.setModalIsShowing(true)

    const wrapper = mountComponent()
    const descriptionInput = wrapper.get('input[name="description"]')
    await descriptionInput.setValue('Cool')

    const cancelButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
    await cancelButton.trigger('click')

    expect(searchStore.modalIsShowing).toBe(false)
    expect(searchStore.searchFilters).toEqual(DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS)
  })
})

describe('Reset button', async () => {
  test('resets the search filters state', async () => {
    const initialSearchFilters = {
      ...DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,
      description: 'Initial description',
    }

    const searchStore = useSearchFinanceRecordsStore()
    searchStore.searchFilters = initialSearchFilters

    const wrapper = mountComponent()
    const descriptionInput = wrapper.get('input[name="description"]')
    await descriptionInput.setValue('Updated description')

    const resetButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.RESET)
    await resetButton.trigger('click')

    expect(searchStore.searchFilters).toEqual(initialSearchFilters)
  })
})
