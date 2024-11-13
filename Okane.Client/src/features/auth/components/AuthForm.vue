<script setup lang="ts">
// External
import { computed, ref } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import PasswordRequirements from '@features/auth/components/PasswordRequirements.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { type AuthFormState, type AuthFormType } from '@features/auth/types/authForm'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

import { validatePassword } from '@features/auth/utils/authForm'

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
  if (isRegisterForm.value) return AUTH_COPY.REGISTER
  return AUTH_COPY.LOGIN
})

const { data: passwordRequirements } = useQueryPasswordRequirements({
  enabled: isRegisterForm.value,
})

const validatePasswordResult = computed(() => {
  if (passwordRequirements.value) {
    return validatePassword({
      password: formState.value.password,
      passwordConfirm: formState.value.passwordConfirm,
      minPasswordLength: passwordRequirements.value.minLength,
    })
  }

  return null
})

const formIsValid = computed<boolean>(() => {
  const { email, name, password } = formState.value

  const validations = [Boolean(email), Boolean(password)]

  if (isRegisterForm.value) {
    validations.push(Boolean(name), validatePasswordResult.value?.isValid ?? false)
  }

  return !validations.includes(false)
})
</script>

<template>
  <form v-if="passwordRequirements" class="form" @submit.prevent="emit('submit', formState)">
    <fieldset class="fieldset">
      <FormInput
        v-if="isRegisterForm"
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

      <template v-if="isRegisterForm">
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
      </template>

      <button class="submit-button" :disabled="!formIsValid" type="submit">
        {{ submitButtonText }}
      </button>
    </fieldset>
  </form>
</template>

<style scoped lang="scss">
.form {
  max-width: 22rem;
}

.fieldset {
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
