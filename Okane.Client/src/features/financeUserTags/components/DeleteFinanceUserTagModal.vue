<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import AppButton from '@shared/components/button/AppButton.vue'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FinanceUserTagSummary from '@features/financeUserTags/components/FinanceUserTagSummary.vue'
import Modal from '@shared/components/modal/Modal.vue'
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
    :heading-text="FINANCE_USER_TAGS_COPY.DELETE_MODAL.HEADING"
    :is-showing="!!provider.userTagToDelete"
    :modal-heading-id="modalHeadingId"
    @close="closeModal"
  >
    <template v-if="provider.userTagToDelete">
      <p>{{ FINANCE_USER_TAGS_COPY.DELETE_MODAL.CONFIRMATION }}</p>
      <FinanceUserTagSummary :user-tag="provider.userTagToDelete" />

      <ErrorMessage v-if="deleteMutation.isError.value">
        {{ FINANCE_USER_TAGS_COPY.DELETE_MODAL.ERROR }}
      </ErrorMessage>

      <ModalActions>
        <AppButton @click="handleDelete" focus-on-mount variant="warning">{{
          SHARED_COPY.ACTIONS.DELETE
        }}</AppButton>
        <AppButton @click="closeModal">{{ SHARED_COPY.ACTIONS.CANCEL }}</AppButton>
      </ModalActions>
    </template>
  </Modal>
</template>
