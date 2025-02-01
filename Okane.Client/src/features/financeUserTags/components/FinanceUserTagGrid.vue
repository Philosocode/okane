<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import FinanceUserTagGridItem from '@features/financeUserTags/components/FinanceUserTagGridItem.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { type FinanceUserTagMap } from '@features/financeUserTags/types/financeUserTag'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  type ManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

export type FinanceUserTagGridProps = {
  userTagMap: FinanceUserTagMap
}

const props = defineProps<FinanceUserTagGridProps>()
const provider = inject(MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL) as ManageFinanceUserTagsProvider
</script>

<template>
  <div class="grid">
    <FinanceUserTagGridItem
      v-for="userTag in props.userTagMap[provider.userTagType]"
      :key="userTag.id"
      show-actions
      :user-tag="userTag"
    />
  </div>

  <p v-if="props.userTagMap[provider.userTagType].length === 0">
    {{ FINANCE_USER_TAGS_COPY.MANAGE_PAGE.NO_FINANCE_TAGS_TO_DISPLAY }}
  </p>
</template>

<style scoped>
.grid {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-block-start: var(--space-md);
}
</style>
