<script setup lang="ts">
// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

export type AppliedTagsFilterProps = Pick<FinanceRecordsSearchFilters, 'tags'>

const props = defineProps<AppliedTagsFilterProps>()
</script>

<template>
  <li v-if="props.tags.length > 0">
    {{ FINANCES_COPY.SEARCH_FILTERS.APPLIED_TAGS({ tags: props.tags }) }}
  </li>
</template>
