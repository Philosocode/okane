// External
import { endOfDay, isValid as isValidDate } from 'date-fns'

// Internal
import {
  type FinanceRecordSearchFilters,
  type FinanceRecordSearchFiltersFormState,
} from '@features/financeRecords/types/searchFilters'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type MinMax } from '@shared/types/search'
import {
  type CreateFinanceRecordRequest,
  type EditFinanceRecordRequest,
  type SaveFinanceRecordFormState,
} from '@features/financeRecords/types/saveFinanceRecord'

import { convertValueAndOperatorToMinMax, isComparisonOperator } from '@shared/utils/search'
import { createMappers } from '@shared/utils/mappers'
import { mapDate, mapDateOnlyTimestampToLocalizedDate } from '@shared/utils/dateTime'

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
    sortDirection: filters.sortDirection,
    sortField: filters.sortField,
  })

  if (filters.description) params.append('description', filters.description)
  if (filters.type) params.append('type', filters.type)

  // Amount.
  let amountResult: MinMax<number> = { min: undefined, max: undefined }
  if (filters.amount1 && filters.amountOperator) {
    amountResult = convertValueAndOperatorToMinMax(filters.amountOperator, filters.amount1)
  } else if (filters.amount1 && filters.amount2) {
    amountResult = { min: filters.amount1, max: filters.amount2 }
  }

  if (amountResult.min) params.append('minAmount', amountResult.min.toString())
  if (amountResult.max) params.append('maxAmount', amountResult.max.toString())

  // Happened At.
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
    params.append('happenedAfter', happenedAtResult.min.toISOString())
  }

  // The happenedAt dates lack a time portion. If we want to include all records that occur on and
  // before a day, we need to set the time to just before midnight.
  if (happenedAtResult.max) {
    params.append('happenedBefore', endOfDay(happenedAtResult.max).toISOString())
  }

  // Tags.
  filters.tags.forEach((tag) => {
    params.append('tagIds', tag.id.toString())
  })

  return params
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
