<script setup lang="ts">
// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedDescriptionFilterProps = Pick<FinanceRecordSearchFilters, 'description'>

const props = defineProps<AppliedDescriptionFilterProps>()
</script>

<template>
  <li v-if="props.description">
    {{ FINANCES_COPY.SEARCH_FILTERS.APPLIED_DESCRIPTION({ description: props.description }) }}
  </li>
</template>
