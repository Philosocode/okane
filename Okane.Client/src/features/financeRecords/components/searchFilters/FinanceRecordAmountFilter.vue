<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { FINANCE_RECORD_MIN_AMOUNT } from '@features/financeRecords/constants/saveFinanceRecord'

export type FinanceRecordAmountFilterProps = Pick<
  FinanceRecordSearchFilters,
  'amount1' | 'amountOperator' | 'amount2'
>
const props = defineProps<FinanceRecordAmountFilterProps>()
const isShowingRange = computed(() => !props.amountOperator)

const emit = defineEmits<{
  (e: 'change', formState: Partial<FinanceRecordSearchFilters>): void
}>()
</script>

<template>
  <ToggleableRangeInputs
    :is-showing-range="isShowingRange"
    :label="FINANCES_COPY.PROPERTIES.AMOUNT"
    :operator="props.amountOperator"
    @operator-change="emit('change', { amountOperator: $event })"
    operator-select-name="amountOperator"
  >
    <template #input1>
      <FormInput
        :model-value="props.amount1"
        @update:model-value="emit('change', { amount1: $event })"
        name="amount1"
        :label="
          isShowingRange
            ? FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.MIN_AMOUNT
            : FINANCES_COPY.PROPERTIES.AMOUNT
        "
        :required="isShowingRange"
        :step="FINANCE_RECORD_MIN_AMOUNT"
        :type="INPUT_TYPE.NUMBER"
        with-hidden-label
      />
    </template>

    <template #input2>
      <FormInput
        :model-value="props.amount2"
        @update:model-value="emit('change', { amount2: $event })"
        name="amount2"
        :label="FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.MAX_AMOUNT"
        required
        :step="FINANCE_RECORD_MIN_AMOUNT"
        :type="INPUT_TYPE.NUMBER"
        with-hidden-label
      />
    </template>
  </ToggleableRangeInputs>
</template>
