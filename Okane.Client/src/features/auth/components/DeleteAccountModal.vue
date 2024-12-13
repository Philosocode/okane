<script setup lang="ts">
// External
import { useRouter } from 'vue-router'
import { useTemplateRef, watchEffect } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { ROUTE_NAME } from '@shared/services/router/router'
import { SHARED_COPY } from '@shared/constants/copy'

import { useDeleteAccount } from '@features/auth/composables/useDeleteAccount'
import { useModal } from '@shared/composables/useModal'

const { modalIsShowing, showModal, closeModal } = useModal()
const modalHeadingId = 'delete-account-modal-heading'

const deleteMutation = useDeleteAccount()
const deleteButtonRef = useTemplateRef<HTMLButtonElement>('deleteButtonRef')

const router = useRouter()

watchEffect(() => {
  if (modalIsShowing) {
    deleteButtonRef.value?.focus()
  }
})

function handleDelete() {
  deleteMutation.mutate(undefined, {
    async onSuccess() {
      await router.push({ name: ROUTE_NAME.ACCOUNT_DELETED })
    },
  })
}
</script>

<template>
  <button class="delete-button" @click="showModal">
    {{ AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT }}
  </button>

  <Modal :is-showing="modalIsShowing" :modal-heading-id="modalHeadingId" @close="closeModal">
    <ModalHeading :id="modalHeadingId">{{ AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT }}</ModalHeading>
    <p class="confirmation">{{ AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT_CONFIRMATION }}</p>

    <ModalActions>
      <button class="delete-button" ref="deleteButtonRef" @click.prevent="handleDelete">
        {{ SHARED_COPY.ACTIONS.DELETE }}
      </button>
      <button @click="closeModal">
        {{ SHARED_COPY.ACTIONS.CANCEL }}
      </button>
    </ModalActions>

    <p v-if="deleteMutation.isError.value" class="error-text">
      {{ AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT_ERROR }}
    </p>
  </Modal>
</template>

<style scoped lang="scss">
.delete-button {
  background-color: var(--color-red-300);
  border: none;
  border-radius: pxToRem(4);
  padding: var(--space-2xs);

  &:hover {
    background-color: var(--color-red-400);
  }

  &:active {
    background-color: var(--color-red-500);
  }
}

.error-text {
  color: var(--color-error);
}
</style>
