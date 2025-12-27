<script setup lang="ts">
// Internal
import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedTagsFilterProps = Pick<FinanceRecordSearchFilters, 'tags'>

const props = defineProps<AppliedTagsFilterProps>()
</script>

<template>
  <li v-if="props.tags.length > 0">
    {{ FINANCES_SEARCH_FILTERS_COPY.APPLIED_TAGS({ tags: props.tags }) }}
  </li>
</template>
