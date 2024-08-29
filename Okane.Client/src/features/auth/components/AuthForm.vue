<script setup lang="ts">
// External
import { computed, ref } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'

import type { AuthFormState, AuthFormType } from '@features/auth/types/authForm'

import { isValidPassword } from '@features/auth/utils/authForm'

const emit = defineEmits<{
  (e: 'submit', formState: AuthFormState): void
}>()

const props = defineProps<{ formType: AuthFormType }>()

const formState = ref({
  email: '',
  name: '',
  password: '',
  passwordConfirm: '',
})

const isRegisterForm = computed<boolean>(() => props.formType == 'register')
const submitButtonText = computed<string>(() => {
  if (isRegisterForm.value) return 'Register'
  return 'Login'
})

const formIsValid = computed<boolean>(() => {
  const { email, name, password, passwordConfirm } = formState.value

  const validations = [Boolean(email), Boolean(password)]

  if (isRegisterForm.value) {
    validations.push(
      Boolean(name),
      Boolean(passwordConfirm),
      password == passwordConfirm,
      isValidPassword(password).isValid,
    )
  }

  return !validations.includes(false)
})
</script>

<template>
  <form @submit.prevent="emit('submit', formState)">
    <fieldset>
      <FormInput v-if="isRegisterForm" v-model="formState.name" label="Name" name="name" type="text" />

      <FormInput label="Email" name="email" type="email" v-model="formState.email" />
      <FormInput label="Password" name="password" type="password" v-model="formState.password" />

      <FormInput v-if="isRegisterForm" v-model="formState.passwordConfirm" label="Confirm password"
        name="passwordConfirm" type="password" />

      <button class="submit-button" :disabled="!formIsValid" type="submit">
        {{ submitButtonText }}
      </button>
    </fieldset>
  </form>
</template>

<style scoped lang="scss">
form {
  max-width: 22rem;
}

fieldset {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.submit-button {
  margin-top: var(--space-sm);

  &:disabled {
    color: var(--color-gray-300);
  }
}
</style>
