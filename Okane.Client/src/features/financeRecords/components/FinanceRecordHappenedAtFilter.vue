<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { mapDate, mapUTCTimestampToLocalDate } from '@shared/utils/dateTime'

export type FinanceRecordHappenedAtFilterProps = Pick<
  FinanceRecordsSearchFilters,
  'happenedAt1' | 'happenedAt2' | 'happenedAtOperator'
>

const props = defineProps<FinanceRecordHappenedAtFilterProps>()
const emit = defineEmits<{
  (e: 'change', formState: Partial<FinanceRecordsSearchFilters>): void
}>()

const happenedAt1 = computed(() => {
  if (!props.happenedAt1) return ''
  return mapDate.to.dateOnlyTimestamp(props.happenedAt1)
})

const happenedAt2 = computed(() => {
  if (!props.happenedAt2) return ''
  return mapDate.to.dateOnlyTimestamp(props.happenedAt2)
})

const isShowingRange = computed(() => !props.happenedAtOperator)

function handleDateChange(key: 'happenedAt1' | 'happenedAt2', timestamp: string) {
  return {
    [key]: mapUTCTimestampToLocalDate(timestamp),
  }
}

function handleOperatorChange(operator?: COMPARISON_OPERATOR) {
  emit('change', {
    happenedAtOperator: operator,
  })
}
</script>

<template>
  <ToggleableRangeInputs
    :is-showing-range="isShowingRange"
    :label="FINANCES_COPY.PROPERTIES.HAPPENED_AT"
    :operator="props.happenedAtOperator"
    @operator-change="handleOperatorChange"
    operator-select-name="happenedAtOperator"
  >
    <template #input1>
      <FormInput
        :model-value="happenedAt1"
        @update:model-value="emit('change', handleDateChange('happenedAt1', $event))"
        name="happenedAt1"
        :label="
          isShowingRange
            ? FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.HAPPENED_AFTER
            : FINANCES_COPY.PROPERTIES.HAPPENED_AT
        "
        :required="isShowingRange"
        :type="INPUT_TYPE.DATE"
        with-hidden-label
      />
    </template>

    <template #input2>
      <FormInput
        :model-value="happenedAt2"
        @update:model-value="emit('change', handleDateChange('happenedAt2', $event))"
        :label="FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.HAPPENED_BEFORE"
        name="happenedAt2"
        required
        :type="INPUT_TYPE.DATE"
        with-hidden-label
      />
    </template>
  </ToggleableRangeInputs>
</template>
