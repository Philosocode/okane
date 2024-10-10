<script setup lang="ts">
// External
import { computed, inject } from 'vue'

// Internal
import Heading from '@shared/components/Heading.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { capitalize } from '@shared/utils/string'

const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider

const amountCriteria = computed(() => {
  const { filters } = searchProvider

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
  const { filters } = searchProvider
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
        {{ searchProvider.filters.type || capitalize(SHARED_COPY.COMMON.ALL) }}
      </li>
      <li v-if="searchProvider.filters.description">
        {{ FINANCES_COPY.PROPERTIES.DESCRIPTION }}: {{ searchProvider.filters.description }}
      </li>
      <li v-if="amountCriteria">{{ FINANCES_COPY.PROPERTIES.AMOUNT }}: {{ amountCriteria }}</li>
      <li v-if="happenedAtCriteria">
        {{ FINANCES_COPY.PROPERTIES.HAPPENED_AT }}: {{ happenedAtCriteria }}
      </li>
      <li>
        {{ SHARED_COPY.SEARCH.SORT_BY }}: {{ searchProvider.filters.sortField }},
        {{ searchProvider.filters.sortDirection }}
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
