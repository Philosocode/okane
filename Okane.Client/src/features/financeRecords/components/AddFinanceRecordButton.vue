<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'

const saveStore = useSaveFinanceRecordStore()
</script>

<template>
  <button class="button" @click="saveStore.setIsCreating(true)">
    <FontAwesomeIcon
      icon="fa-solid fa-plus"
      :title="FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.SHOW_MODAL"
    />
  </button>
</template>

<style scoped>
.button {
  --button-size: clamp(2rem, 2rem + 2.5vw, 3rem);
  --offset: clamp(0.5rem, 0.5rem + 0.5vw, 1rem);

  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  position: fixed;
  bottom: var(--offset);
  right: var(--offset);
  height: var(--button-size);
  width: var(--button-size);
}
</style>
