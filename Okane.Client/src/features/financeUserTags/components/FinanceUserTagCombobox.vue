<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import TagCombobox, { type TagComboboxProps } from '@shared/components/form/TagCombobox.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'
import { type Tag } from '@shared/types/tag'

import { useCreateFinanceUserTag } from '@features/financeUserTags/composables/useCreateFinanceUserTag'
import { useQueryFinanceUserTags } from '@features/financeUserTags/composables/useQueryFinanceUserTags'

export type FinanceUserTagComboboxProps = {
  id: TagComboboxProps['id']
  selectedTags: TagComboboxProps['selectedTags']
  tagTypes: FinanceUserTag['type'][]

  createdTagType?: FINANCE_RECORD_TYPE
}

const props = defineProps<FinanceUserTagComboboxProps>()

const emit = defineEmits<{
  (e: 'change', tags: Tag[]): void
  (e: 'createTag', tag: Tag): void
}>()

const createMutation = useCreateFinanceUserTag()
const queryUserTags = useQueryFinanceUserTags()

const tagOptions = computed(() => {
  const userTagMap = queryUserTags.data.value
  if (!userTagMap) return []

  const uniqueTagIds = new Set()
  const uniqueTags: Tag[] = []

  function pushUniqueTag(userTag: FinanceUserTag) {
    if (!uniqueTagIds.has(userTag.tag.id)) {
      uniqueTagIds.add(userTag.tag.id)
      uniqueTags.push({ ...userTag.tag })
    }
  }

  if (props.tagTypes.includes(FINANCE_RECORD_TYPE.REVENUE)) {
    userTagMap.Revenue.forEach(pushUniqueTag)
  }

  if (props.tagTypes.includes(FINANCE_RECORD_TYPE.EXPENSE)) {
    userTagMap.Expense.forEach(pushUniqueTag)
  }

  return uniqueTags
})

function handleCreateTag(tagToCreate: Tag): false {
  if (props.createdTagType) {
    createMutation.mutate(
      {
        name: tagToCreate.name,
        type: props.createdTagType,
      },
      {
        onSuccess(response) {
          emit('createTag', response.items[0].tag)
        },
      },
    )
  }

  // Returning false prevents Multiselect from trying to save a finance user tag without an ID.
  // Instead, the responsibility for inserting the finance user tag should be moved to the mutation.
  // If the mutation succeeds, the created finance user tag will be cached and appear as a
  // combobox option.
  return false
}
</script>

<template>
  <TagCombobox
    :all-tags="tagOptions"
    :disabled="createMutation.isError.value || queryUserTags.isError.value"
    :id="props.id"
    :loading="createMutation.isPending.value || queryUserTags.isLoading.value"
    :on-create="props.createdTagType ? handleCreateTag : undefined"
    :selected-tags="props.selectedTags"
    @change="(tags) => emit('change', tags)"
  />

  <ErrorMessage v-if="queryUserTags.isError.value">
    {{ FINANCE_USER_TAGS_COPY.COMBOBOX.FETCH_ERROR }}
  </ErrorMessage>

  <ErrorMessage v-if="createMutation.isError.value">
    {{ FINANCE_USER_TAGS_COPY.COMBOBOX.CREATE_ERROR }}
  </ErrorMessage>
</template>
