<script setup lang="ts">
// Internal
import IconButton from '@shared/components/IconButton.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

export type FinanceUserTagGridItemProps = {
  userTag: FinanceUserTag
}

const props = defineProps<FinanceUserTagGridItemProps>()
</script>

<template>
  <div class="root">
    <p>{{ props.userTag.tag.name }}</p>

    <div class="actions">
      <IconButton
        icon="fa-solid fa-pen-to-square"
        :title="FINANCE_USER_TAGS_COPY.MANAGE_PAGE.RENAME_FINANCE_TAG"
      />
      <IconButton
        icon="fa-solid fa-trash"
        :title="FINANCE_USER_TAGS_COPY.MANAGE_PAGE.DELETE_FINANCE_TAG"
      />
    </div>
  </div>
</template>

<style scoped>
.root {
  align-items: center;
  border: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  min-width: 10rem;
  padding: 0.5rem 1rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
</style>
