// External
import { endOfDay, isValid as isValidDate } from 'date-fns'

import { type LocationQuery } from 'vue-router'

// Internal
import { COMPARISON_OPERATOR } from '@shared/constants/search'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES,
} from '@features/financeRecords/constants/searchFilters'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FinanceUserTagMap } from '@features/financeUserTags/types/financeUserTag'
import { type MinMax } from '@shared/types/search'
import { type Tag } from '@shared/types/tag'
import {
  HAPPENED_AT_TIMEFRAME,
  type FinanceRecordSearchFilters,
  type FinanceRecordSearchFiltersFormState,
} from '@features/financeRecords/types/searchFilters'
import {
  type CreateFinanceRecordRequest,
  type EditFinanceRecordRequest,
  type SaveFinanceRecordFormState,
} from '@features/financeRecords/types/saveFinanceRecord'

import { createMappers } from '@shared/utils/mappers'
import { isNumeric } from '@shared/utils/number'
import { getQueryParamArray, getQueryParamValue } from '@shared/utils/url'
import {
  getHappenedAtTimeframeStartDate,
  isFinanceRecordSortField,
  isHappenedAtTimeframe,
} from '@features/financeRecords/utils/searchFilters'
import { isFinanceRecordType } from '@features/financeRecords/utils/financeRecord'
import { mapDate, mapDateOnlyTimestampToLocalizedDate } from '@shared/utils/dateTime'
import {
  convertValueAndOperatorToMinMax,
  isComparisonOperator,
  isSortDirection,
} from '@shared/utils/search'

export const mapFinanceRecord = createMappers({
  saveFinanceRecordFormState(financeRecord: FinanceRecord): SaveFinanceRecordFormState {
    return {
      ...financeRecord,
      amount: financeRecord.amount.toString(),
      happenedAt: mapDate.to.dateTimeLocal(financeRecord.happenedAt),
    }
  },
})

export const mapSaveFinanceRecordFormState = createMappers({
  createFinanceRecordRequest(formState: SaveFinanceRecordFormState): CreateFinanceRecordRequest {
    return {
      ...formState,
      amount: parseFloat(formState.amount),
      happenedAt: new Date(formState.happenedAt),
      tagIds: formState.tags.map((tag) => tag.id),
    }
  },
  editFinanceRecordRequest(
    formState: Partial<SaveFinanceRecordFormState>,
  ): EditFinanceRecordRequest {
    const { amount, happenedAt, tags, ...rest } = formState
    return {
      ...rest,
      ...(amount && { amount: parseFloat(amount) }),
      ...(happenedAt && { happenedAt: new Date(happenedAt) }),
      ...(tags && { tagIds: tags.map((tag) => tag.id) }),
    }
  },
})

export const mapFinanceRecordSearchFilters = createMappers({
  financeRecordSearchFiltersFormState(
    filters: FinanceRecordSearchFilters,
  ): FinanceRecordSearchFiltersFormState {
    const {
      amount1,
      amount2,
      amountOperator,
      happenedAt1,
      happenedAt2,
      happenedAtOperator,
      ...rest
    } = filters

    return {
      ...rest,
      amount1: amount1?.toString() ?? '',
      amount2: amount2?.toString() ?? '',
      amountOperator: amountOperator?.toString() ?? '',
      happenedAt1: happenedAt1 ? mapDate.to.dateOnlyTimestamp(happenedAt1) : '',
      happenedAt2: happenedAt2 ? mapDate.to.dateOnlyTimestamp(happenedAt2) : '',
      happenedAtOperator: happenedAtOperator?.toString() ?? '',
    }
  },
  URLSearchParams: mapFinanceRecordSearchFiltersToURLSearchParams,
})

function mapFinanceRecordSearchFiltersToURLSearchParams(
  filters: FinanceRecordSearchFilters,
): URLSearchParams {
  const params = new URLSearchParams({
    [FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.SORT_DIRECTION]: filters.sortDirection,
    [FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.SORT_FIELD]: filters.sortField,
  })

  if (filters.description) {
    params.append(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.DESCRIPTION, filters.description)
  }
  if (filters.type) {
    params.append(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.TYPE, filters.type)
  }

  // Amount
  let amountResult: MinMax<number> = { min: undefined, max: undefined }
  if (filters.amount1 && filters.amountOperator) {
    amountResult = convertValueAndOperatorToMinMax(filters.amountOperator, filters.amount1)
  } else if (filters.amount1 && filters.amount2) {
    amountResult = { min: filters.amount1, max: filters.amount2 }
  }

  if (amountResult.min) {
    params.append(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.MIN_AMOUNT, amountResult.min.toString())
  }

  if (amountResult.max) {
    params.append(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.MAX_AMOUNT, amountResult.max.toString())
  }

  // Happened At
  params.append(
    FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.HAPPENED_AT_TIMEFRAME,
    filters.happenedAtTimeframe,
  )

  let happenedAtResult: MinMax<Date> = { min: undefined, max: undefined }
  if (filters.happenedAt1 && filters.happenedAtOperator) {
    happenedAtResult = convertValueAndOperatorToMinMax(
      filters.happenedAtOperator,
      filters.happenedAt1,
    )
  } else if (filters.happenedAt1 && filters.happenedAt2) {
    happenedAtResult = { min: filters.happenedAt1, max: filters.happenedAt2 }
  }

  if (happenedAtResult.min) {
    params.append(
      FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.HAPPENED_AFTER,
      happenedAtResult.min.toISOString(),
    )
  }

  // The happenedAt dates lack a time portion. If we want to include all records that occur on and
  // before a day, we need to set the time to just before midnight.
  if (happenedAtResult.max) {
    params.append(
      FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.HAPPENED_BEFORE,
      endOfDay(happenedAtResult.max).toISOString(),
    )
  }

  // Tags
  filters.tags.forEach((tag) => {
    params.append(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.TAG_IDS, tag.id.toString())
  })

  return params
}

/**
 * Remove invalid query params and set defaults for missing required query params.
 * Mirrors mapFinanceRecordSearchFiltersToURLSearchParams.
 *
 * @param query
 * @param userTagMap
 * @returns {string} Normalized query params.
 */
export function mapLocationQueryToFinanceRecordSearchFilter(
  query: LocationQuery,
  userTagMap: FinanceUserTagMap,
): FinanceRecordSearchFilters {
  const filters: FinanceRecordSearchFilters = { ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS, tags: [] }

  parseAmountQueryParams(filters, query)

  const description = getQueryParamValue(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.DESCRIPTION, query)
  if (description !== '') filters.description = description

  parseHappenedAtQueryParams(filters, query)
  parseSortQueryParams(filters, query)
  parseTagQueryParams(filters, query, userTagMap)

  const type = getQueryParamValue(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.TYPE, query)
  if (isFinanceRecordType(type)) filters.type = type

  return filters
}

function parseAmountQueryParams(filters: FinanceRecordSearchFilters, query: LocationQuery) {
  const minAmount = parseFloat(
    getQueryParamValue(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.MIN_AMOUNT, query),
  )
  const minAmountValid = isNumeric(minAmount)
  const maxAmount = parseFloat(
    getQueryParamValue(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.MAX_AMOUNT, query),
  )
  const maxAmountValid = isNumeric(maxAmount)

  if (minAmountValid) {
    filters.amount1 = minAmount
    filters.amountOperator = COMPARISON_OPERATOR.GTE
  }

  if (maxAmountValid) {
    filters.amount2 = maxAmount
    filters.amountOperator = COMPARISON_OPERATOR.LTE
  }

  if (minAmountValid && maxAmountValid) {
    filters.amountOperator = undefined
  }
}

function parseHappenedAtQueryParams(filters: FinanceRecordSearchFilters, query: LocationQuery) {
  const timeframe = getQueryParamValue(
    FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.HAPPENED_AT_TIMEFRAME,
    query,
  )
  const timeframeValid = isHappenedAtTimeframe(timeframe)

  // If a non-custom timeframe is passed, that takes precedence over any other happenedAt fields.
  // e.g. If timeframe is "thisMonth" and happenedBefore is "1 year ago", we want to ignore the
  // happenedBefore value.
  if (timeframeValid && timeframe !== HAPPENED_AT_TIMEFRAME.CUSTOM) {
    filters.happenedAtTimeframe = timeframe
    filters.happenedAt1 = getHappenedAtTimeframeStartDate(timeframe)
    filters.happenedAtOperator = COMPARISON_OPERATOR.GTE

    return
  }

  const happenedAfter = new Date(
    getQueryParamValue(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.HAPPENED_AFTER, query),
  )
  const happenedAfterValid = isValidDate(happenedAfter)
  if (happenedAfterValid) {
    filters.happenedAt1 = happenedAfter
    filters.happenedAtOperator = COMPARISON_OPERATOR.GTE
    filters.happenedAtTimeframe = HAPPENED_AT_TIMEFRAME.CUSTOM
  }

  const happenedBefore = new Date(
    getQueryParamValue(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.HAPPENED_BEFORE, query),
  )
  const happenedBeforeValid = isValidDate(happenedBefore)
  if (happenedBeforeValid) {
    filters.happenedAt2 = happenedBefore
    filters.happenedAtOperator = COMPARISON_OPERATOR.LTE
    filters.happenedAtTimeframe = HAPPENED_AT_TIMEFRAME.CUSTOM
  }

  if (happenedAfterValid && happenedBeforeValid) {
    filters.happenedAtOperator = undefined
  }
}

function parseSortQueryParams(filters: FinanceRecordSearchFilters, query: LocationQuery) {
  const sortDirection = getQueryParamValue(
    FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.SORT_DIRECTION,
    query,
  )
  if (isSortDirection(sortDirection)) filters.sortDirection = sortDirection

  const sortField = getQueryParamValue(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.SORT_FIELD, query)
  if (isFinanceRecordSortField(sortField)) filters.sortField = sortField
}

function parseTagQueryParams(
  filters: FinanceRecordSearchFilters,
  query: LocationQuery,
  userTagMap: FinanceUserTagMap,
) {
  const tagIds = getQueryParamArray(FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES.TAG_IDS, query)
  const uniqueTagIds = new Set<string>(tagIds)

  const tagsById: Record<string, Tag> = {}
  userTagMap.Expense.forEach((userTag) => {
    tagsById[userTag.tag.id] = userTag.tag
  })
  userTagMap.Revenue.forEach((userTag) => {
    tagsById[userTag.tag.id] = userTag.tag
  })

  uniqueTagIds.forEach((tagId) => {
    const tagById = tagsById[tagId]
    if (tagById) filters.tags.push(tagById)
  })
}

export const mapFinanceRecordSearchFiltersFormState = createMappers({
  financeRecordSearchFilters(
    formState: FinanceRecordSearchFiltersFormState,
  ): FinanceRecordSearchFilters {
    const {
      amount1,
      amount2,
      amountOperator,
      happenedAt1,
      happenedAt2,
      happenedAtOperator,
      ...rest
    } = formState

    const filters: FinanceRecordSearchFilters = { ...rest }

    const amount1Parsed = parseFloat(amount1)
    filters.amount1 = isNaN(amount1Parsed) ? undefined : amount1Parsed

    const amount2Parsed = parseFloat(amount2)
    filters.amount2 = isNaN(amount2Parsed) ? undefined : amount2Parsed

    filters.amountOperator = isComparisonOperator(amountOperator) ? amountOperator : undefined

    const happenedAt1Parsed = mapDateOnlyTimestampToLocalizedDate(happenedAt1)
    filters.happenedAt1 = isValidDate(happenedAt1Parsed) ? happenedAt1Parsed : undefined

    const happenedAt2Parsed = mapDateOnlyTimestampToLocalizedDate(happenedAt2)
    filters.happenedAt2 = isValidDate(happenedAt2Parsed) ? happenedAt2Parsed : undefined

    filters.happenedAtOperator = isComparisonOperator(happenedAtOperator)
      ? happenedAtOperator
      : undefined

    return filters
  },
})
