<script setup lang="ts">
// Internal
import Kicker from '@shared/components/typography/Kicker.vue'
import Pill from '@shared/components/wrapper/Pill.vue'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type FinanceRecordTypePillProps = Pick<FinanceRecord, 'type'>

const props = defineProps<FinanceRecordTypePillProps>()
</script>

<template>
  <Pill class="pill" :class="props.type.toLowerCase()">
    <Kicker class="type">{{ props.type }}</Kicker>
  </Pill>
</template>

<style scoped lang="scss">
.pill {
  font-weight: 600;
  padding-block: 0.3em;
  padding-inline: var(--space-2xs);

  @include respond(sm) {
    font-size: var(--space-sm);
  }
}

.expense {
  background-color: var(--color-error-deep);
  border-color: var(--color-error-dim);
}

.revenue {
  background-color: var(--color-accent-deep);
  border-color: var(--color-accent-dim);
}
</style>
