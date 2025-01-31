<script setup lang="ts">
// External
import { computed, ref, watch } from 'vue'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import CardHeading from '@shared/components/typography/CardHeading.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import Heading from '@shared/components/Heading.vue'
import PasswordRequirements from '@features/auth/components/PasswordRequirements.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'
import { SHARED_COPY } from '@shared/constants/copy'

import { type PasswordRequirements as PasswordRequirementsType } from '@features/auth/types/authForm'

import { useEditSelf } from '@features/auth/composables/useEditSelf'

import { isObjectType } from '@shared/utils/object'
import { validatePassword } from '@features/auth/utils/authForm'

type Props = {
  requirements: PasswordRequirementsType
}

const props = defineProps<Props>()

const editMutation = useEditSelf()
const editSucceeded = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const combinedInputValues = computed(
  () => currentPassword.value + newPassword.value + newPasswordConfirm.value,
)

const validateResult = computed(() => {
  return validatePassword({
    password: newPassword.value,
    passwordConfirm: newPasswordConfirm.value,
    minPasswordLength: props.requirements.minLength,
  })
})

const submitButtonDisabled = computed(
  () => currentPassword.value.length === 0 || !validateResult.value.isValid,
)

const submitError = computed(() => {
  if (!editMutation.isError.value) return ''

  const error = editMutation.error.value

  const passwordMismatchErrorKey = 'PasswordMismatch'
  if (isObjectType(error) && error[passwordMismatchErrorKey]) {
    return AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_ERROR_CURRENT_PASSWORD_INVALID
  }

  return AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_ERROR_GENERAL
})

function handleSubmit() {
  editMutation.mutate(
    {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    },
    {
      onSuccess() {
        editSucceeded.value = true
      },
    },
  )
}

// Clear the succeeded flag if the user tries to edit their password again.
watch(combinedInputValues, () => {
  if (editSucceeded.value) editSucceeded.value = false
})
</script>

<template>
  <CardHeading tag="h2">{{ AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD }}</CardHeading>
  <AuthForm
    :submit-button-text="SHARED_COPY.ACTIONS.SAVE"
    :submit-button-is-disabled="submitButtonDisabled"
    :submit-error="submitError"
    :submit-success="editSucceeded ? AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_SUCCESS : ''"
    @submit="handleSubmit"
  >
    <FormInput
      :label="AUTH_COPY.ACCOUNT_PAGE.CURRENT_PASSWORD"
      name="currentPassword"
      :type="INPUT_TYPE.PASSWORD"
      v-model="currentPassword"
    />
    <FormInput
      :label="AUTH_COPY.ACCOUNT_PAGE.NEW_PASSWORD"
      name="newPassword"
      :type="INPUT_TYPE.PASSWORD"
      v-model="newPassword"
    />
    <FormInput
      :label="AUTH_COPY.ACCOUNT_PAGE.NEW_PASSWORD_CONFIRM"
      name="newPasswordConfirm"
      :type="INPUT_TYPE.PASSWORD"
      v-model="newPasswordConfirm"
    />
    <PasswordRequirements
      v-if="combinedInputValues && !validateResult.isValid"
      :checks="validateResult.passwordChecks"
      :min-password-length="props.requirements.minLength"
    />
  </AuthForm>
</template>
