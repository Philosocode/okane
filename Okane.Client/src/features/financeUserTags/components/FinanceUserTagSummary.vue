<script setup lang="ts">
// Internal
import Card from '@shared/components/wrapper/Card.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

export type FinanceUserTagSummaryProps = {
  userTag: FinanceUserTag
}

const props = defineProps<FinanceUserTagSummaryProps>()
</script>

<template>
  <Card class="tag">
    <p>{{ FINANCE_USER_TAGS_COPY.MANAGE_PAGE.TYPE }}: {{ props.userTag.type }}</p>
    <p>{{ FINANCE_USER_TAGS_COPY.MANAGE_PAGE.NAME }}: {{ props.userTag.tag.name }}</p>
  </Card>
</template>

<style scoped>
.tag {
  padding: var(--space-sm);
}
</style>
