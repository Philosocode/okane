<script setup lang="ts">
// External
import { inject } from 'vue'
import { useRouter } from 'vue-router'

// Internal
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'
import SearchFinanceRecordsSummary from '@features/financeRecords/components/SearchFinanceRecordsSummary.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { ROUTE_NAME } from '@shared/services/router/router'

const router = useRouter()
const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
</script>

<template>
  <div>
    <SearchFinanceRecordsSummary />

    <div class="buttons">
      <button @click="searchProvider.setModalIsShowing(true)">
        {{ FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS }}
      </button>

      <button @click="router.push({ name: ROUTE_NAME.MANAGE_FINANCE_TAGS })">
        {{ FINANCES_COPY.MANAGE_TAGS }}
      </button>
    </div>

    <SearchFinanceRecordsModal />
  </div>
</template>

<style scoped>
.buttons {
  margin-top: var(--space-sm);

  & > button:last-child {
    margin-left: var(--space-sm);
  }
}
</style>
