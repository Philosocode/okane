<script setup lang="ts">
// Internal
import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedTypeFilterProps = Pick<FinanceRecordSearchFilters, 'type'>

const props = defineProps<AppliedTypeFilterProps>()
</script>

<template>
  <li v-if="props.type">
    {{ FINANCES_SEARCH_FILTERS_COPY.APPLIED_TYPE({ type: props.type }) }}
  </li>
</template>
