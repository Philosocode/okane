<script setup lang="ts">
// Internal
import AppliedAmountFilter from '@features/financeRecords/components/searchFilters/AppliedAmountFilter.vue'
import AppliedDescriptionFilter from '@features/financeRecords/components/searchFilters/AppliedDescriptionFilter.vue'
import AppliedHappenedAtFilter from '@features/financeRecords/components/searchFilters/AppliedHappenedAtFilter.vue'
import AppliedSorting from '@features/financeRecords/components/searchFilters/AppliedSorting.vue'
import AppliedTagsFilter from '@features/financeRecords/components/searchFilters/AppliedTagsFilter.vue'
import AppliedTypeFilter from '@features/financeRecords/components/searchFilters/AppliedTypeFilter.vue'
import BulletedList from '@shared/components/wrapper/BulletedList.vue'
import CardHeading from '@shared/components/typography/CardHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

const searchStore = useFinanceRecordSearchStore()
</script>

<template>
  <div>
    <CardHeading tag="h3"
      >{{ FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.APPLIED_SEARCH_FILTERS }}
    </CardHeading>

    <BulletedList>
      <AppliedTypeFilter :type="searchStore.filters.type" />
      <AppliedDescriptionFilter :description="searchStore.filters.description" />
      <AppliedAmountFilter
        :amount1="searchStore.filters.amount1"
        :amount2="searchStore.filters.amount2"
        :amount-operator="searchStore.filters.amountOperator"
      />
      <AppliedHappenedAtFilter
        :happened-at1="searchStore.filters.happenedAt1"
        :happened-at2="searchStore.filters.happenedAt2"
        :happened-at-operator="searchStore.filters.happenedAtOperator"
      />
      <AppliedTagsFilter :tags="searchStore.filters.tags" />
      <AppliedSorting
        :sort-direction="searchStore.filters.sortDirection"
        :sort-field="searchStore.filters.sortField"
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
