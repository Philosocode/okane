<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import Card from '@shared/components/wrappers/Card.vue'
import IconButton from '@shared/components/IconButton.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  type ManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

export type FinanceUserTagGridItemProps = {
  userTag: FinanceUserTag
}

const props = defineProps<FinanceUserTagGridItemProps>()
const provider = inject(MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL) as ManageFinanceUserTagsProvider
</script>

<template>
  <Card class="root">
    <p class="tag-name">{{ props.userTag.tag.name }}</p>

    <div class="actions">
      <IconButton
        icon="fa-solid fa-pen-to-square"
        :title="FINANCE_USER_TAGS_COPY.MANAGE_PAGE.RENAME_FINANCE_TAG"
        @click="provider.setUserTagToRename(props.userTag)"
      />
      <IconButton
        icon="fa-solid fa-trash"
        :title="FINANCE_USER_TAGS_COPY.MANAGE_PAGE.DELETE_FINANCE_TAG"
        @click="provider.setUserTagToDelete(props.userTag)"
      />
    </div>
  </Card>
</template>

<style scoped lang="scss">
.root {
  align-items: center;
  display: flex;
  gap: var(--space-md);
  justify-content: space-between;
  padding: var(--space-2xs) var(--space-xs);

  @include respond(sm) {
    gap: var(--space-xl);
  }
}

.actions {
  display: flex;
  align-items: center;
}

.tag-name {
  padding-inline-start: var(--space-2xs);

  @include respond(sm) {
    padding-inline-start: var(--space-xs);
  }
}
</style>
