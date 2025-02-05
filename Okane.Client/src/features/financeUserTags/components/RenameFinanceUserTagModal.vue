<script setup lang="ts">
// External
import { computed, inject, ref } from 'vue'

// Internal
import AppButton from '@shared/components/AppButton.vue'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FinanceUserTagSummary from '@features/financeUserTags/components/FinanceUserTagSummary.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { useRenameFinanceUserTag } from '@features/financeUserTags/composables/useRenameFinanceUserTag'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  type ManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

const modalHeadingId = 'rename-finance-user-tag-modal-heading'
const renameMutation = useRenameFinanceUserTag()
const provider = inject(MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL) as ManageFinanceUserTagsProvider

const name = ref('')

const submitDisabled = computed(() => {
  if (!name.value) return true
  if (name.value.toLocaleLowerCase() === provider.userTagToRename?.tag.name) return true
  return renameMutation.isPending.value
})

function closeModal() {
  name.value = ''
  provider.setUserTagToRename(undefined)
}

function handleSubmit() {
  if (!provider.userTagToRename) return

  renameMutation.mutate(
    {
      id: provider.userTagToRename.id,
      name: name.value,
    },
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
    :heading-text="FINANCE_USER_TAGS_COPY.RENAME_MODAL.HEADING"
    :is-showing="!!provider.userTagToRename"
    :modal-heading-id="modalHeadingId"
    @close="closeModal"
  >
    <template v-if="provider.userTagToRename">
      <FinanceUserTagSummary :user-tag="provider.userTagToRename" />

      <form ref="form" @submit.prevent="handleSubmit" class="form">
        <FormInput
          focus-on-mount
          :label="FINANCE_USER_TAGS_COPY.RENAME_MODAL.UPDATED_NAME"
          name="name"
          v-model="name"
          required
        />

        <ErrorMessage v-if="renameMutation.isError.value">
          {{ FINANCE_USER_TAGS_COPY.RENAME_MODAL.ERROR }}
        </ErrorMessage>

        <ModalActions>
          <AppButton type="submit" :disabled="submitDisabled" variant="callToAction">{{
            SHARED_COPY.ACTIONS.RENAME
          }}</AppButton>
          <AppButton @click="closeModal" type="button">{{ SHARED_COPY.ACTIONS.CANCEL }}</AppButton>
        </ModalActions>
      </form>
    </template>
  </Modal>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
