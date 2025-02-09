<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { type FinanceRecordSearchFiltersFormState } from '@features/financeRecords/types/searchFilters'

export type FinanceRecordHappenedAtFilterProps = Pick<
  FinanceRecordSearchFiltersFormState,
  'happenedAt1' | 'happenedAt2' | 'happenedAtOperator'
>

const props = defineProps<FinanceRecordHappenedAtFilterProps>()
const emit = defineEmits<{
  (e: 'change', formState: Partial<FinanceRecordSearchFiltersFormState>): void
}>()

const isShowingRange = computed(() => !props.happenedAtOperator)
</script>

<template>
  <ToggleableRangeInputs
    :is-showing-range="isShowingRange"
    :label="FINANCES_COPY.PROPERTIES.HAPPENED_AT"
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
</template>
