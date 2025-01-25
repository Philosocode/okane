<script setup lang="ts">
// Internal
import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

export type FinanceUserTagSummaryProps = {
  userTag: FinanceUserTag
}

const props = defineProps<FinanceUserTagSummaryProps>()
</script>

<template>
  <div class="tag">
    <p>{{ FINANCE_USER_TAGS_COPY.MANAGE_PAGE.TYPE }}: {{ props.userTag.type }}</p>
    <p>{{ FINANCE_USER_TAGS_COPY.MANAGE_PAGE.NAME }}: {{ props.userTag.tag.name }}</p>
  </div>
</template>

<style scoped>
.tag {
  border: 1px solid var(--color-card-border);
  padding: var(--space-sm);
}
</style>
