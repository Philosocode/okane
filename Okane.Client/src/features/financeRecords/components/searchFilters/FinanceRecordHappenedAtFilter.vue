<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  HAPPENED_AT_TIMEFRAME,
  HAPPENED_AT_TIMEFRAME_OPTIONS,
} from '@features/financeRecords/constants/searchFilters'
import { INPUT_TYPE } from '@shared/constants/form'

import { type FinanceRecordSearchFiltersFormState } from '@features/financeRecords/types/searchFilters'

import { getHappenedAtTimeframeStartDate } from '@features/financeRecords/utils/searchFilters'
import { mapDate } from '@shared/utils/dateTime'

export type FinanceRecordHappenedAtFilterProps = Pick<
  FinanceRecordSearchFiltersFormState,
  'happenedAt1' | 'happenedAt2' | 'happenedAtOperator' | 'happenedAtTimeframe'
>

const props = defineProps<FinanceRecordHappenedAtFilterProps>()
const emit = defineEmits<{
  (e: 'change', formState: Partial<FinanceRecordSearchFiltersFormState>): void
}>()

function handleTimeframeChange(timeframe: HAPPENED_AT_TIMEFRAME) {
  const startDate = getHappenedAtTimeframeStartDate(timeframe)

  emit('change', {
    happenedAtOperator: COMPARISON_OPERATOR.GTE,
    ...(startDate && { happenedAt1: mapDate.to.dateOnlyTimestamp(startDate) }),
    happenedAt2: '',
    happenedAtTimeframe: timeframe as HAPPENED_AT_TIMEFRAME,
  })
}

const isShowingRange = computed(() => !props.happenedAtOperator)
</script>

<template>
  <div>
    <FormSelect
      :options="HAPPENED_AT_TIMEFRAME_OPTIONS"
      :label="FINANCES_COPY.PROPERTIES.HAPPENED_AT"
      name="timeframe"
      :model-value="props.happenedAtTimeframe"
      @update:model-value="handleTimeframeChange($event)"
    />

    <ToggleableRangeInputs
      v-if="props.happenedAtTimeframe === HAPPENED_AT_TIMEFRAME.CUSTOM"
      class="custom-inputs"
      :is-showing-range="isShowingRange"
      :operator="props.happenedAtOperator"
      @operator-change="emit('change', { happenedAtOperator: $event })"
      operator-select-name="happenedAtOperator"
    >
      <template #input1>
        <FormInput
          :model-value="happenedAt1"
          @update:model-value="emit('change', { happenedAt1: $event })"
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
          @update:model-value="emit('change', { happenedAt2: $event })"
          :label="FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.HAPPENED_BEFORE"
          name="happenedAt2"
          required
          :type="INPUT_TYPE.DATE"
          with-hidden-label
        />
      </template>
    </ToggleableRangeInputs>
  </div>
</template>

<style scoped>
.custom-inputs {
  margin-top: 0.5rem;
}
</style>
