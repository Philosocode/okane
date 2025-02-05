<script setup lang="ts">
// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedTagsFilterProps = Pick<FinanceRecordSearchFilters, 'tags'>

const props = defineProps<AppliedTagsFilterProps>()
</script>

<template>
  <li v-if="props.tags.length > 0">
    {{ FINANCES_COPY.SEARCH_FILTERS.APPLIED_TAGS({ tags: props.tags }) }}
  </li>
</template>
