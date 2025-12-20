<script setup lang="ts">
// Internal
import FinanceRecordHappenedAtCustom from '@features/financeRecords/components/searchFilters/FinanceRecordHappenedAtCustom.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SEARCH_FINANCE_RECORDS_TIMEFRAME_OPTIONS } from '@features/financeRecords/constants/searchFilters'

import {
  type FinanceRecordSearchFiltersFormState,
  HAPPENED_AT_TIMEFRAME,
} from '@features/financeRecords/types/searchFilters'
import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { mapDate } from '@shared/utils/dateTime'
import { startOfDay, startOfMonth, startOfYear, subDays } from 'date-fns'

export type FinanceRecordHappenedAtFilterProps = Pick<
  FinanceRecordSearchFiltersFormState,
  'happenedAt1' | 'happenedAt2' | 'happenedAtOperator' | 'happenedAtTimeframe'
>

const props = defineProps<FinanceRecordHappenedAtFilterProps>()
const emit = defineEmits<{
  (e: 'change', formState: Partial<FinanceRecordSearchFiltersFormState>): void
}>()

function handleTimeframeChange(timeframe: string) {
  const now = Date.now()
  let startDate: Date | undefined
  if (timeframe === HAPPENED_AT_TIMEFRAME.PAST_30_DAYS) {
    startDate = subDays(now, 30)
  } else if (timeframe === HAPPENED_AT_TIMEFRAME.THIS_MONTH) {
    startDate = startOfMonth(now)
  } else if (timeframe === HAPPENED_AT_TIMEFRAME.THIS_YEAR) {
    startDate = startOfYear(now)
  }

  emit('change', {
    happenedAtOperator: COMPARISON_OPERATOR.GTE,
    ...(startDate && { happenedAt1: mapDate.to.dateOnlyTimestamp(startDate) }),
    happenedAt2: '',
    happenedAtTimeframe: timeframe as HAPPENED_AT_TIMEFRAME,
  })
}
</script>

<template>
  <div>
    <FormSelect
      :options="SEARCH_FINANCE_RECORDS_TIMEFRAME_OPTIONS"
      :label="FINANCES_COPY.PROPERTIES.HAPPENED_AT"
      name="timeframe"
      :model-value="props.happenedAtTimeframe"
      @update:model-value="handleTimeframeChange($event)"
    />
    <FinanceRecordHappenedAtCustom
      v-if="props.happenedAtTimeframe === 'custom'"
      class="custom-inputs"
      :happened-at1="props.happenedAt1"
      :happened-at2="props.happenedAt2"
      :happened-at-operator="props.happenedAtOperator"
    />
  </div>
</template>

<style scoped>
.custom-inputs {
  margin-top: 0.5rem;
}
</style>
