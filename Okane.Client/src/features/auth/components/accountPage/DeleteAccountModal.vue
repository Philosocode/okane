<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AppButton from '@shared/components/button/AppButton.vue'
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalTrigger from '@shared/components/modal/ModalTrigger.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { ROUTE_NAME } from '@shared/services/router/router'
import { SHARED_COPY } from '@shared/constants/copy'

import { useDeleteAccount } from '@features/auth/composables/useDeleteAccount'
import { useModal } from '@shared/composables/useModal'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'

const { modalIsShowing, showModal, closeModal } = useModal()
const modalHeadingId = 'delete-account-modal-heading'

const deleteMutation = useDeleteAccount()

const router = useRouter()

function handleDelete() {
  deleteMutation.mutate(undefined, {
    async onSuccess() {
      await router.push({ name: ROUTE_NAME.ACCOUNT_DELETED })
    },
  })
}
</script>

<template>
  <ModalTrigger @click="showModal" variant="warning">
    {{ AUTH_COPY.DELETE_ACCOUNT.HEADING }}
  </ModalTrigger>

  <Modal
    :is-showing="modalIsShowing"
    :heading-text="AUTH_COPY.DELETE_ACCOUNT.HEADING"
    :modal-heading-id="modalHeadingId"
    @close="closeModal"
  >
    <p>{{ AUTH_COPY.DELETE_ACCOUNT.CONFIRMATION }}</p>
    <ModalActions>
      <AppButton focus-on-mount variant="warning" @click.prevent="handleDelete">
        {{ SHARED_COPY.ACTIONS.DELETE }}
      </AppButton>
      <AppButton @click="closeModal">
        {{ SHARED_COPY.ACTIONS.CANCEL }}
      </AppButton>
    </ModalActions>

    <ErrorMessage v-if="deleteMutation.isError.value">
      {{ AUTH_COPY.DELETE_ACCOUNT.ERROR }}
    </ErrorMessage>
  </Modal>
</template>
