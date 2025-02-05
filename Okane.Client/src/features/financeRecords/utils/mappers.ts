// External
import { endOfDay } from 'date-fns'

// Internal
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type MinMax } from '@shared/types/search'
import {
  type CreateFinanceRecordRequest,
  type EditFinanceRecordRequest,
  type SaveFinanceRecordFormState,
} from '@features/financeRecords/types/saveFinanceRecord'

import { convertValueAndOperatorToMinMax } from '@shared/utils/search'
import { createMappers } from '@shared/utils/mappers'
import { mapDate } from '@shared/utils/dateTime'

export const mapFinanceRecord = createMappers({
  saveFinanceRecordFormState(financeRecord: FinanceRecord): SaveFinanceRecordFormState {
    return {
      ...financeRecord,
      happenedAt: mapDate.to.dateTimeLocal(financeRecord.happenedAt),
    }
  },
})

export const mapSaveFinanceRecordFormState = createMappers({
  createFinanceRecordRequest(formState: SaveFinanceRecordFormState): CreateFinanceRecordRequest {
    return {
      ...formState,
      happenedAt: new Date(formState.happenedAt),
      tagIds: formState.tags.map((tag) => tag.id),
    }
  },
  editFinanceRecordRequest(
    formState: Partial<SaveFinanceRecordFormState>,
  ): EditFinanceRecordRequest {
    const { happenedAt, tags, ...rest } = formState
    return {
      ...rest,
      ...(happenedAt && { happenedAt: new Date(happenedAt) }),
      ...(tags && { tagIds: tags.map((tag) => tag.id) }),
    }
  },
})

export const mapFinanceRecordsSearchFilters = createMappers({
  URLSearchParams: mapFinanceRecordsSearchFiltersToURLSearchParams,
})

function mapFinanceRecordsSearchFiltersToURLSearchParams(
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
    params.append('tagId', tag.id.toString())
  })

  return params
}
