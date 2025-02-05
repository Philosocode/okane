<script setup lang="ts">
// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedTypeFilterProps = Pick<FinanceRecordSearchFilters, 'type'>

const props = defineProps<AppliedTypeFilterProps>()
</script>

<template>
  <li v-if="props.type">
    {{ FINANCES_COPY.SEARCH_FILTERS.APPLIED_TYPE({ type: props.type }) }}
  </li>
</template>
