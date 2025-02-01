<script setup lang="ts">
// Internal
import Pill from '@shared/components/Pill.vue'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type FinanceRecordTagsProps = Pick<FinanceRecord, 'tags'>

const props = defineProps<FinanceRecordTagsProps>()
</script>

<template>
  <div class="tags">
    <Pill v-for="tag in props.tags" :key="tag.id" class="pill">
      {{ tag.name }}
    </Pill>
  </div>
</template>

<style scoped lang="scss">
.pill {
  padding-inline: var(--space-sm);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
