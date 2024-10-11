<script setup lang="ts">
// Internal
import Heading from '@shared/components/Heading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { pluralize } from '@shared/utils/string'

type Props = {
  amount: number
  count: number
  headingText: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="cell">
    <Heading class="heading" tag="h4">{{ props.headingText }}</Heading>
    <p class="amount">${{ props.amount.toFixed(2) }}</p>
    <p class="count">
      {{ props.count }}
      {{ pluralize({ text: FINANCES_COPY.STATS.RECORD, count: props.count, suffix: 's' }) }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.cell {
  flex-grow: 1;
  padding-block: var(--space-lg);
  text-align: center;

  & > * + * {
    margin-top: var(--space-xs);
  }
}

.amount {
  font-size: var(--font-size-md);
}

.heading {
  margin-block: 0;
}

.count {
  font-size: var(--font-size-sm);
}
</style>
