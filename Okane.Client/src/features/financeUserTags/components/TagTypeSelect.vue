<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import FormSelect from '@shared/components/form/FormSelect.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'
import { FINANCE_RECORD_TYPE_OPTIONS } from '@features/financeRecords/constants/saveFinanceRecord'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  type ManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

const provider = inject(MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL) as ManageFinanceUserTagsProvider
</script>

<template>
  <div class="tag-select">
    <FormSelect
      :label="FINANCE_USER_TAGS_COPY.MANAGE_PAGE.TAG_TYPE"
      name="tagType"
      :options="FINANCE_RECORD_TYPE_OPTIONS"
      :model-value="provider.userTagType"
      @update:model-value="provider.setUserTagType"
    />
  </div>
</template>
