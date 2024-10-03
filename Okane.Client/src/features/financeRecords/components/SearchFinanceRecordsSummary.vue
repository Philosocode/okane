<script setup lang="ts">
// External
import { storeToRefs } from 'pinia'
import { computed, toValue } from 'vue'

// Internal
import Heading from '@shared/components/Heading.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

import { capitalize } from '@shared/utils/string'

const searchStore = useSearchFinanceRecordsStore()
const { searchFilters } = storeToRefs(searchStore)

const amountCriteria = computed(() => {
  const filters = toValue(searchFilters)

  if (filters.amountOperator && filters.amount1) {
    return `${filters.amountOperator} ${filters.amount1.toFixed(2)}`
  }

  if (filters.amount1 && filters.amount2) {
    return [
      `${COMPARISON_OPERATOR.GTE} $${filters.amount1.toFixed(2)}`,
      SHARED_COPY.CONJUNCTIONS.AND.toUpperCase(),
      `${COMPARISON_OPERATOR.LTE} $${filters.amount2.toFixed(2)}`,
    ].join(' ')
  }

  return ''
})

const happenedAtCriteria = computed(() => {
  const filters = toValue(searchFilters)
  const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

  if (filters.happenedAtOperator && filters.happenedAt1) {
    const happenedAt = formatter.format(filters.happenedAt1)
    return `${filters.happenedAtOperator} ${happenedAt}`
  }

  if (filters.happenedAt1 && filters.happenedAt2) {
    const happenedAt1 = formatter.format(filters.happenedAt1)
    const happenedAt2 = formatter.format(filters.happenedAt2)

    return [
      `${COMPARISON_OPERATOR.GTE} ${happenedAt1}`,
      SHARED_COPY.CONJUNCTIONS.AND.toUpperCase(),
      `${COMPARISON_OPERATOR.LTE} ${happenedAt2}`,
    ].join(' ')
  }

  return ''
})
</script>

<template>
  <section class="root">
    <Heading class="heading" tag="h4">{{
      FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.APPLIED_SEARCH_FILTERS
    }}</Heading>
    <ul class="search-criteria">
      <li>
        {{ FINANCES_COPY.PROPERTIES.TYPE }}:
        {{ searchStore.searchFilters.type || capitalize(SHARED_COPY.COMMON.ALL) }}
      </li>
      <li v-if="searchFilters.description">
        {{ FINANCES_COPY.PROPERTIES.DESCRIPTION }}: {{ searchStore.searchFilters.description }}
      </li>
      <li v-if="amountCriteria">{{ FINANCES_COPY.PROPERTIES.AMOUNT }}: {{ amountCriteria }}</li>
      <li v-if="happenedAtCriteria">
        {{ FINANCES_COPY.PROPERTIES.HAPPENED_AT }}: {{ happenedAtCriteria }}
      </li>
      <li>
        {{ SHARED_COPY.SEARCH.SORT_BY }}: {{ searchFilters.sortField }},
        {{ searchFilters.sortDirection }}
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.root {
  border: pxToRem(1) solid var(--color-gray-500);
  border-radius: 0.25rem;
  padding: var(--space-md);
}

.heading {
  margin-block: 0;
}

.search-criteria {
  list-style-type: disc;
  padding-left: var(--space-md);
}
</style>
