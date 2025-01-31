<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import AppliedAmountFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedAmountFilter.vue'
import AppliedDescriptionFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedDescriptionFilter.vue'
import AppliedHappenedAtFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedHappenedAtFilter.vue'
import AppliedSorting from '@features/financeRecords/components/searchFinanceRecords/AppliedSorting.vue'
import AppliedTagsFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedTagsFilter.vue'
import AppliedTypeFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedTypeFilter.vue'
import BulletedList from '@shared/components/BulletedList.vue'
import CardHeading from '@shared/components/typography/CardHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
</script>

<template>
  <div>
    <CardHeading tag="h3"
      >{{ FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.APPLIED_SEARCH_FILTERS }}
    </CardHeading>

    <BulletedList>
      <AppliedTypeFilter :type="searchProvider.filters.type" />
      <AppliedDescriptionFilter :description="searchProvider.filters.description" />
      <AppliedAmountFilter
        :amount1="searchProvider.filters.amount1"
        :amount2="searchProvider.filters.amount2"
        :amount-operator="searchProvider.filters.amountOperator"
      />
      <AppliedHappenedAtFilter
        :happened-at1="searchProvider.filters.happenedAt1"
        :happened-at2="searchProvider.filters.happenedAt2"
        :happened-at-operator="searchProvider.filters.happenedAtOperator"
      />
      <AppliedTagsFilter :tags="searchProvider.filters.tags" />
      <AppliedSorting
        :sort-direction="searchProvider.filters.sortDirection"
        :sort-field="searchProvider.filters.sortField"
      />
    </BulletedList>
  </div>
</template>

<style scoped lang="scss">
.root {
  border: var(--border-main);
  padding: var(--space-md);
}

.heading {
  margin-bottom: var(--space-2xs);
}
</style>
