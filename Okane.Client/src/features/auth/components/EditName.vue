<script setup lang="ts">
// External
import { ref, watch } from 'vue'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import Heading from '@shared/components/Heading.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'
import { SHARED_COPY } from '@shared/constants/copy'

import { useAuthStore } from '@features/auth/composables/useAuthStore'
import { useEditSelf } from '@features/auth/composables/useEditSelf'

const authStore = useAuthStore()
const editMutation = useEditSelf()
const editSucceeded = ref(false)
const name = ref(authStore.authUser?.name ?? '')

function handleSubmit() {
  editMutation.mutate(
    { name: name.value },
    {
      onSuccess() {
        editSucceeded.value = true
      },
    },
  )
}

// Clear the succeeded flag if the user tries to edit their name again.
watch(name, () => {
  if (editSucceeded.value) editSucceeded.value = false
})
</script>

<template>
  <Heading tag="h2">{{ AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME }}</Heading>
  <AuthForm
    :submit-button-text="SHARED_COPY.ACTIONS.SAVE"
    :submit-error="editMutation.isError.value ? AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_ERROR : ''"
    :submit-button-is-disabled="!name || name === authStore.authUser?.name"
    :submit-success="editSucceeded ? AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_SUCCESS : ''"
    @submit="handleSubmit"
  >
    <FormInput
      :label="AUTH_COPY.AUTH_FORM.NAME"
      name="name"
      :type="INPUT_TYPE.TEXT"
      v-model="name"
    />
  </AuthForm>
</template>
