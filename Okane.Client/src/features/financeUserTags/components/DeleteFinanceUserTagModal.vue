<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import FinanceUserTagSummary from '@features/financeUserTags/components/FinanceUserTagSummary.vue'
import Modal from '@shared/components/modal/Modal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'

import { useDeleteFinanceUserTag } from '@features/financeUserTags/composables/useDeleteFinanceUserTag'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  type ManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

const modalHeadingId = 'delete-finance-user-tag-modal-heading'
const deleteMutation = useDeleteFinanceUserTag()
const provider = inject(MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL) as ManageFinanceUserTagsProvider

function closeModal() {
  provider.setUserTagToDelete(undefined)
}

function handleDelete() {
  if (!provider.userTagToDelete) return

  deleteMutation.mutate(
    { id: provider.userTagToDelete.id },
    {
      onSuccess() {
        closeModal()
      },
    },
  )
}
</script>

<template>
  <Modal
    :is-showing="!!provider.userTagToDelete"
    :modal-heading-id="modalHeadingId"
    @close="closeModal"
  >
    <template v-if="provider.userTagToDelete">
      <ModalHeading :id="modalHeadingId">{{
        FINANCE_USER_TAGS_COPY.DELETE_MODAL.HEADING
      }}</ModalHeading>

      <p>{{ FINANCE_USER_TAGS_COPY.DELETE_MODAL.CONFIRMATION }}</p>
      <FinanceUserTagSummary :user-tag="provider.userTagToDelete" />

      <p v-if="deleteMutation.isError.value" class="error">
        {{ FINANCE_USER_TAGS_COPY.DELETE_MODAL.ERROR }}
      </p>

      <ModalActions>
        <button @click="handleDelete">{{ SHARED_COPY.ACTIONS.DELETE }}</button>
        <button @click="closeModal">{{ SHARED_COPY.ACTIONS.CANCEL }}</button>
      </ModalActions>
    </template>
  </Modal>
</template>

<style scoped>
.error {
  color: var(--color-error);
}
</style>
