<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import FloatingCreateButton from '@shared/components/button/FloatingCreateButton.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  type SaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

const saveProvider = inject(SAVE_FINANCE_RECORD_SYMBOL) as SaveFinanceRecordProvider
</script>

<template>
  <FloatingCreateButton
    :title="FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.SHOW_MODAL"
    @click="saveProvider.setIsCreating(true)"
  />
</template>
