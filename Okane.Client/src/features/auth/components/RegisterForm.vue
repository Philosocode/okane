<script setup lang="ts">
// External
import { computed, ref } from 'vue'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import Heading from '@shared/components/nav/Heading.vue'
import PasswordRequirements from '@features/auth/components/PasswordRequirements.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { type PasswordRequirements as PasswordRequirementsType } from '@features/auth/types/authForm'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { omitObjectKeys } from '@shared/utils/object'
import { validatePassword } from '@features/auth/utils/authForm'

type Props = {
  passwordRequirements: PasswordRequirementsType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const authStore = useAuthStore()

const formState = ref({
  email: '',
  name: '',
  password: '',
  passwordConfirm: '',
})

const hasSubmitError = ref(false)

const validatePasswordResult = computed(() => {
  return validatePassword({
    password: formState.value.password,
    passwordConfirm: formState.value.passwordConfirm,
    minPasswordLength: props.passwordRequirements.minLength,
  })
})

const formIsValid = computed<boolean>(() => {
  const { email, name, password } = formState.value

  const validations = [
    email.length > 0,
    password.length > 0,
    name.length > 0,
    validatePasswordResult.value?.isValid ?? false,
  ]

  return !validations.includes(false)
})

async function handleSubmit() {
  const postData = omitObjectKeys(formState.value, ['passwordConfirm'])

  try {
    await authStore.register(postData.email, postData.name, postData.password)
    emit('success')
  } catch (err) {
    console.error('Error registering:', err)
    hasSubmitError.value = true
  }
}
</script>

<template>
  <Heading tag="h1">{{ AUTH_COPY.AUTH_FORM.REGISTER }}</Heading>
  <AuthForm
    :submit-button-is-disabled="!formIsValid"
    :submit-button-text="AUTH_COPY.AUTH_FORM.REGISTER"
    :submit-error="hasSubmitError ? AUTH_COPY.AUTH_FORM.ERRORS.REGISTER : ''"
    @submit="handleSubmit"
  >
    <FormInput
      :label="AUTH_COPY.AUTH_FORM.NAME"
      name="name"
      :type="INPUT_TYPE.TEXT"
      v-model="formState.name"
    />

    <FormInput
      :label="AUTH_COPY.AUTH_FORM.EMAIL"
      name="email"
      :type="INPUT_TYPE.EMAIL"
      v-model="formState.email"
    />

    <FormInput
      :label="AUTH_COPY.AUTH_FORM.PASSWORD"
      name="password"
      :type="INPUT_TYPE.PASSWORD"
      v-model="formState.password"
    />

    <FormInput
      :label="AUTH_COPY.AUTH_FORM.CONFIRM_PASSWORD"
      name="passwordConfirm"
      :type="INPUT_TYPE.PASSWORD"
      v-model="formState.passwordConfirm"
    />

    <PasswordRequirements
      v-if="!validatePasswordResult?.isValid"
      :checks="validatePasswordResult?.passwordChecks ?? {}"
      :min-password-length="passwordRequirements.minLength"
    />
  </AuthForm>
</template>
