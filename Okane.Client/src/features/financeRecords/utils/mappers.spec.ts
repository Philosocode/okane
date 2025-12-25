// External
import { endOfDay } from 'date-fns'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'
import {
  HAPPENED_AT_TIMEFRAME,
  type FinanceRecordSearchFilters,
  type FinanceRecordSearchFiltersFormState,
} from '@features/financeRecords/types/searchFilters'

import * as utils from '@features/financeRecords/utils/mappers'
import * as searchFilterUtils from '@features/financeRecords/utils/searchFilters'
import { mapDate, mapDateOnlyTimestampToLocalizedDate } from '@shared/utils/dateTime'

import { createTestTag } from '@tests/factories/tag'
import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import {
  createTestFinanceRecord,
  createTestSaveFinanceRecordFormState,
} from '@tests/factories/financeRecord'
import type { FinanceUserTagMap } from '@features/financeUserTags/types/financeUserTag'
import type { LocationQuery } from 'vue-router'

describe('mapFinanceRecord', () => {
  test('saveFinanceRecordFormState', () => {
    const financeRecord = createTestFinanceRecord()
    const result = utils.mapFinanceRecord.to.saveFinanceRecordFormState(financeRecord)
    expect(result).toEqual({
      ...financeRecord,
      amount: financeRecord.amount.toString(),
      happenedAt: mapDate.to.dateTimeLocal(financeRecord.happenedAt),
    })
  })
})

describe('mapSaveFinanceRecordFormState', () => {
  test('createFinanceRecordRequest', () => {
    const formState = createTestSaveFinanceRecordFormState()
    const result = utils.mapSaveFinanceRecordFormState.to.createFinanceRecordRequest(formState)
    expect(result).toEqual({
      ...result,
      amount: parseFloat(formState.amount),
      happenedAt: new Date(formState.happenedAt),
      tagIds: formState.tags.map((tag) => tag.id),
    })
  })

  describe('editFinanceRecordRequest', () => {
    test('ignores amount if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual(changes)
    })

    test('converts amount to a number if defined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        amount: '1.23',
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual({ ...changes, amount: 1.23 })
    })

    test('ignores happenedAt if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual(changes)
    })

    test('converts happenedAt to a date if defined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        happenedAt: '2018-06-12T19:30',
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual({
        happenedAt: new Date(changes.happenedAt ?? 0),
        type: changes.type,
      })
    })

    test('ignores tags if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = { tags: undefined }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual(changes)
    })

    test('maps tagIds if tags is defined', () => {
      const tag = createTestTag()
      const changes: Partial<SaveFinanceRecordFormState> = { tags: [tag] }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual({ tagIds: [tag.id] })
    })
  })
})

describe('mapFinanceRecordSearchFilters', () => {
  describe('financeRecordSearchFiltersFormState', () => {
    const getResult = utils.mapFinanceRecordSearchFilters.to.financeRecordSearchFiltersFormState

    test('converts empty values to empty strings', () => {
      const emptyFilters: FinanceRecordSearchFilters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        amount1: undefined,
        amount2: undefined,
        amountOperator: undefined,
        happenedAt1: undefined,
        happenedAt2: undefined,
        happenedAtOperator: undefined,
      }

      const formState = getResult(emptyFilters)
      expect(formState.amount1).toBe('')
      expect(formState.amount2).toBe('')
      expect(formState.amountOperator).toBe('')
      expect(formState.happenedAt1).toBe('')
      expect(formState.happenedAt2).toBe('')
      expect(formState.happenedAtOperator).toBe('')
    })

    test('converts amounts into strings', () => {
      const filters: FinanceRecordSearchFilters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        amount1: 1.1,
        amount2: 2.2,
      }

      const formState = getResult(filters)
      expect(formState.amount1).toBe('1.1')
      expect(formState.amount2).toBe('2.2')
    })

    test('converts dates into strings', () => {
      const filters: FinanceRecordSearchFilters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt1: new Date('2025-01-01T10:10:10.000Z'),
        happenedAt2: new Date('2025-01-02T10:10:10.000Z'),
      }

      const formState = getResult(filters)
      expect(formState.happenedAt1).toBe('2025-01-01')
      expect(formState.happenedAt2).toBe('2025-01-02')
    })
  })

  describe('URLSearchParams', () => {
    function getParams(overrides?: Partial<FinanceRecordSearchFilters>) {
      const filters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        ...overrides,
      }
      return utils.mapFinanceRecordSearchFilters.to.URLSearchParams(filters)
    }

    test('sortField and sortDirection', () => {
      const filters = DEFAULT_FINANCE_RECORD_SEARCH_FILTERS
      const params = getParams(filters)
      expect(params.get('sortDirection')).toBe(filters.sortDirection)
      expect(params.get('sortField')).toBe(filters.sortField)
    })

    test('does not include missing fields', () => {
      const params = getParams({ happenedAt1: undefined })
      const optionalFields = [
        'description',
        'happenedAfter',
        'happenedBefore',
        'minAmount',
        'maxAmount',
        'tagIds',
        'type',
      ]

      optionalFields.forEach((field) => {
        expect(params.has(field)).toBe(false)
      })
    })

    test('description', () => {
      const filters = { description: 'Cool description' }
      const params = getParams(filters)
      expect(params.get('description')).toBe(filters.description)
    })

    test('tags', () => {
      const tags = [createTestTag({ id: 1 }), createTestTag({ id: 2 })]
      const filters = { tags }
      const params = getParams(filters)
      expect(params.getAll('tagIds')).toEqual(['1', '2'])
    })

    test('type', () => {
      const filters = { type: FINANCE_RECORD_TYPE.REVENUE }
      const params = getParams(filters)
      expect(params.get('type')).toBe(filters.type)
    })

    describe('amount', () => {
      test('does not include an amount when amount1 is missing', () => {
        const filters = {
          amount1: undefined,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.EQUAL,
        }
        const params = getParams(filters)
        expect(params.has('amount')).toBe(false)
      })

      test('does not include an amount when amountOperator is missing', () => {
        const filters = {
          amount1: 1,
          amount2: undefined,
          amountOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.has('amount')).toBe(false)
      })

      test('includes minAmount when operator is ≥', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.GTE,
        }
        const params = getParams(filters)
        expect(params.get('minAmount')).toBe(filters.amount1.toString())
      })

      test('includes maxAmount when operator is ≤', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.LTE,
        }
        const params = getParams(filters)
        expect(params.get('maxAmount')).toBe(filters.amount1.toString())
      })

      test('includes minAmount and maxAmount when operator is =', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.EQUAL,
        }
        const params = getParams(filters)
        expect(params.get('minAmount')).toBe(filters.amount1.toString())
        expect(params.get('maxAmount')).toBe(filters.amount1.toString())
      })

      test('includes minAmount and maxAmount with a valid range', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.get('minAmount')).toBe(filters.amount1.toString())
        expect(params.get('maxAmount')).toBe(filters.amount2.toString())
      })
    })

    describe('happened at', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2025-01-01')

      test('does not include a happenedAt when happenedAt1 is missing', () => {
        const filters = {
          happenedAt1: undefined,
          happenedAt2: date2,
          happenedAtOperator: COMPARISON_OPERATOR.GTE,
        }
        const params = getParams(filters)
        expect(params.has('happenedAfter')).toBe(false)
        expect(params.has('happenedBefore')).toBe(false)
      })

      test('does not include a happenedAt when happenedAtOperator is missing', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: undefined,
          happenedAtOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.has('happenedAfter')).toBe(false)
        expect(params.has('happenedBefore')).toBe(false)
      })

      test('includes happenedAfter when operator is ≥', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          amountOperator: COMPARISON_OPERATOR.GTE,
        }
        const params = getParams(filters)
        expect(params.get('happenedAfter')).toBe(encodeURI(filters.happenedAt1.toISOString()))
      })

      test('includes happenedBefore when operator is ≤', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          happenedAtOperator: COMPARISON_OPERATOR.LTE,
        }
        const params = getParams(filters)
        expect(params.get('happenedBefore')).toBe(
          encodeURI(endOfDay(filters.happenedAt1).toISOString()),
        )
      })

      test('includes happenedAfter and happenedBefore when operator is =', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          happenedAtOperator: COMPARISON_OPERATOR.EQUAL,
        }
        const params = getParams(filters)
        expect(params.get('happenedAfter')).toBe(encodeURI(filters.happenedAt1.toISOString()))
        expect(params.get('happenedBefore')).toBe(
          encodeURI(endOfDay(filters.happenedAt1).toISOString()),
        )
      })

      test('includes happenedAfter and happenedBefore with a valid range', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          happenedAtOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.get('happenedAfter')).toBe(encodeURI(filters.happenedAt1?.toISOString()))
        expect(params.get('happenedBefore')).toBe(
          encodeURI(endOfDay(filters.happenedAt2).toISOString()),
        )
      })
    })
  })
})

describe('mapFinanceRecordSearchFiltersFormState', () => {
  describe('financeRecordSearchFilters', () => {
    const getFilters = utils.mapFinanceRecordSearchFiltersFormState.to.financeRecordSearchFilters

    const emptyState: FinanceRecordSearchFiltersFormState = {
      happenedAt1: '',
      happenedAt2: '',
      amount1: '',
      amount2: '',
      amountOperator: '',
      description: '',
      happenedAtOperator: '',
      happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.PAST_30_DAYS,
      sortDirection: SORT_DIRECTION.ASCENDING,
      sortField: 'amount',
      tags: [],
      type: '',
    }

    test('sets empty values to undefined', () => {
      const filters = getFilters(emptyState)
      expect(filters.amount1).toBeUndefined()
      expect(filters.amount2).toBeUndefined()
      expect(filters.amountOperator).toBeUndefined()
      expect(filters.happenedAt1).toBeUndefined()
      expect(filters.happenedAt2).toBeUndefined()
      expect(filters.happenedAtOperator).toBeUndefined()
    })

    test('sets invalid values to undefined', () => {
      const formState = {
        ...emptyState,
        amount1: 'hi',
        amount2: 'a a a a',
        happenedAt1: 'I am not a date',
        happenedAt2: 'I am not a date',
      }

      const filters = getFilters(formState)
      expect(filters.amount1).toBeUndefined()
      expect(filters.amount2).toBeUndefined()
      expect(filters.happenedAt1).toBeUndefined()
      expect(filters.happenedAt2).toBeUndefined()
    })

    test('sets valid amounts', () => {
      const formState = {
        ...emptyState,
        amount1: '1.23',
        amount2: '5000000',
      }

      const filters = getFilters(formState)
      expect(filters.amount1).toBe(1.23)
      expect(filters.amount2).toBe(5_000_000)
    })

    test('sets valid happenedAt values', () => {
      const formState = {
        ...emptyState,
        happenedAt1: '2024-01-01',
        happenedAt2: '2024-02-02',
      }

      const filters = getFilters(formState)
      expect(filters.happenedAt1).toEqual(mapDateOnlyTimestampToLocalizedDate('2024-01-01'))
      expect(filters.happenedAt2).toEqual(mapDateOnlyTimestampToLocalizedDate('2024-02-02'))
    })
  })
})

describe('mapLocationQueryToFinanceRecordSearchFilter', () => {
  function assertDefaultFilters(filters: FinanceRecordSearchFilters) {
    expect(filters).toEqual({ ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS })
  }

  function getResult(
    query: LocationQuery,
    userTagMap: FinanceUserTagMap = { Expense: [], Revenue: [] },
  ) {
    return utils.mapLocationQueryToFinanceRecordSearchFilter(query, userTagMap)
  }

  test('returns default values when query is empty', () => {
    assertDefaultFilters(getResult({}))
  })

  describe('amounts', () => {
    test('processes minAmount only', () => {
      const query = { minAmount: '10.5' }
      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        amount1: 10.5,
        amountOperator: COMPARISON_OPERATOR.GTE,
      })
    })

    test('ignores invalid minAmount', () => {
      const query = { minAmount: 'invalid' }
      assertDefaultFilters(getResult(query))
    })

    test('processes maxAmount only', () => {
      const query = { maxAmount: '100' }
      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        amount2: 100,
        amountOperator: COMPARISON_OPERATOR.LTE,
      })
    })

    test('ignores invalid maxAmount', () => {
      const query = { maxAmount: 'invalid' }
      assertDefaultFilters(getResult(query))
    })

    test('processes both minAmount and maxAmount', () => {
      const query = { minAmount: '10', maxAmount: '100' }
      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        amount1: 10,
        amount2: 100,
        amountOperator: undefined,
      })
    })
  })

  describe('description', () => {
    test('processes valid description', () => {
      const query = { description: 'Cool description' }
      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        description: 'Cool description',
      })
    })

    test('ignores empty description', () => {
      const query = { description: '' }
      assertDefaultFilters(getResult(query))
    })
  })

  describe('happened ats', () => {
    test('parses non-custom timeframe', () => {
      const startDate = new Date(123456)
      vi.spyOn(searchFilterUtils, 'getHappenedAtTimeframeStartDate').mockReturnValue(startDate)

      const query = {
        happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.PAST_30_DAYS,

        // With non-custom timeframe, these query paramsshould be ignored.
        happenedAfter: startDate.toISOString(),
        happenedBefore: startDate.toISOString(),
      }

      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt1: startDate,
        happenedAtOperator: COMPARISON_OPERATOR.GTE,
      })
    })

    test('ignores invalid happenedAfter', () => {
      const query = { happenedAfter: 'invalid' }
      assertDefaultFilters(getResult(query))
    })

    test('ignores invalid happenedBefore', () => {
      const query = { happenedBefore: 'invalid' }
      assertDefaultFilters(getResult(query))
    })

    test('parses only happenedAfter', () => {
      const date = new Date(123456)
      const query = { happenedAfter: date.toISOString() }

      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt1: date,
        happenedAtOperator: COMPARISON_OPERATOR.GTE,
        happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.CUSTOM,
      })
    })

    test('parses happenedAfter wth invalid happenedBefore', () => {
      const date = new Date(123456)
      const query = { happenedAfter: date.toISOString(), happenedBefore: 'invalid' }

      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt1: date,
        happenedAtOperator: COMPARISON_OPERATOR.GTE,
        happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.CUSTOM,
      })
    })

    test('parses only happenedBefore', () => {
      const date = new Date(123456)
      const query = { happenedBefore: date.toISOString() }

      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt2: date,
        happenedAtOperator: COMPARISON_OPERATOR.LTE,
        happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.CUSTOM,
      })
    })

    test('parses happenedBefore with invalid happenedAfter', () => {
      const date = new Date(123456)
      const query = { happenedAfter: 'invalid', happenedBefore: date.toISOString() }

      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt2: date,
        happenedAtOperator: COMPARISON_OPERATOR.LTE,
        happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.CUSTOM,
      })
    })

    test('parses happenedAfter and happenedBefore', () => {
      const date = new Date(123456)
      const query = { happenedAfter: date.toISOString(), happenedBefore: date.toISOString() }

      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt1: date,
        happenedAt2: date,
        happenedAtOperator: undefined,
        happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.CUSTOM,
      })
    })
  })

  describe('sortDirection', () => {
    test('processes valid sortDirection', () => {
      const query = { sortDirection: SORT_DIRECTION.ASCENDING }
      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        sortDirection: SORT_DIRECTION.ASCENDING,
      })
    })

    test('ignores invalid sortDirection', () => {
      const query = { sortDirection: 'invalid' }
      assertDefaultFilters(getResult(query))
    })
  })

  describe('sortField', () => {
    test('processes valid sortField', () => {
      const query = { sortField: 'amount' }
      expect(getResult(query)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        sortField: 'amount',
      })
    })

    test('ignores invalid sortField', () => {
      const query = { sortField: 'invalid' }
      assertDefaultFilters(getResult(query))
    })
  })

  describe('tagIds', () => {
    test('handles a non-array tag ID', () => {
      const userTag = createTestFinanceUserTag()
      const tagMap: FinanceUserTagMap = {
        Expense: [userTag],
        Revenue: [],
      }
      const query = { tagIds: '1' }
      expect(getResult(query, tagMap)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        tags: [userTag.tag],
      })
    })

    test('dedupes tag IDs', () => {
      const userTag1 = createTestFinanceUserTag({ tag: createTestTag({ id: 1 }) })
      const userTag2 = createTestFinanceUserTag({ tag: createTestTag({ id: 2 }) })
      const userTag3 = createTestFinanceUserTag({ tag: createTestTag({ id: 3 }) })
      const tagMap: FinanceUserTagMap = {
        Expense: [userTag1, userTag2],
        Revenue: [userTag1, userTag2, userTag3],
      }
      const query = { tagIds: ['1', '2', '3'] }
      expect(getResult(query, tagMap)).toEqual({
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        tags: [userTag1.tag, userTag2.tag, userTag3.tag],
      })
    })

    test('ignores tag IDs not present in the map', () => {
      const userTag = createTestFinanceUserTag({ tag: createTestTag({ id: 2 }) })
      const userTagMap: FinanceUserTagMap = {
        Expense: [userTag],
        Revenue: [],
      }
      const query = { tagIds: ['1'] }
      assertDefaultFilters(getResult(query, userTagMap))
    })
  })
})
