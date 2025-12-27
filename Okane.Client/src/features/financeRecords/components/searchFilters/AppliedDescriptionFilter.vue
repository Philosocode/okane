<script setup lang="ts">
// Internal
import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedDescriptionFilterProps = Pick<FinanceRecordSearchFilters, 'description'>

const props = defineProps<AppliedDescriptionFilterProps>()
</script>

<template>
  <li v-if="props.description">
    {{ FINANCES_SEARCH_FILTERS_COPY.APPLIED_DESCRIPTION({ description: props.description }) }}
  </li>
</template>
