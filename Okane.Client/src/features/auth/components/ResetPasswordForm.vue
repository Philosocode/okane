<script setup lang="ts">
// External
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import Heading from '@shared/components/Heading.vue'
import Link from '@shared/components/Link.vue'
import PasswordRequirements from '@features/auth/components/PasswordRequirements.vue'

import { appRoutes } from '@shared/services/router/router'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { type PasswordRequirements as PasswordRequirementsType } from '@features/auth/types/authForm'

import { useResetPassword } from '@features/auth/composables/useResetPassword'

import { validatePassword } from '@features/auth/utils/authForm'

type Props = {
  requirements: PasswordRequirementsType
}

const props = defineProps<Props>()

const route = useRoute()
const params = computed(() => {
  let { email, token } = route.query

  if (typeof email !== 'string') email = ''
  if (typeof token !== 'string') token = ''

  return { email, token }
})

const validURL = computed(() => params.value.email && params.value.token)

const password = ref('')
const passwordConfirm = ref('')
const resetSucceeded = ref(false)

const resetMutation = useResetPassword()

const validateResult = computed(() => {
  return validatePassword({
    password: password.value,
    passwordConfirm: passwordConfirm.value,
    minPasswordLength: props.requirements.minLength,
  })
})

function handleReset() {
  resetMutation.mutate(
    {
      email: params.value.email,
      password: password.value,
      token: params.value.token,
    },
    {
      onSuccess() {
        resetSucceeded.value = true
      },
    },
  )
}
</script>

<template>
  <Heading tag="h1">{{ AUTH_COPY.RESET_PASSWORD.HEADING }}</Heading>
  <AuthForm
    v-if="validURL && !resetSucceeded"
    :submit-button-text="AUTH_COPY.RESET_PASSWORD.SUBMIT_BUTTON"
    :submit-button-is-disabled="!validateResult.isValid || resetMutation.isError.value"
    @submit="handleReset"
  >
    <FormInput
      :label="AUTH_COPY.AUTH_FORM.PASSWORD"
      name="password"
      :type="INPUT_TYPE.PASSWORD"
      v-model="password"
    />
    <FormInput
      :label="AUTH_COPY.AUTH_FORM.CONFIRM_PASSWORD"
      name="passwordConfirm"
      :type="INPUT_TYPE.PASSWORD"
      v-model="passwordConfirm"
    />
    <PasswordRequirements
      v-if="!validateResult?.isValid"
      :checks="validateResult.passwordChecks"
      :min-password-length="props.requirements.minLength"
    />
  </AuthForm>

  <p v-if="resetSucceeded">
    {{ AUTH_COPY.RESET_PASSWORD.RESET_SUCCEEDED.SUCCESS }}
    <Link :to="appRoutes.login.buildPath()">{{
      AUTH_COPY.RESET_PASSWORD.RESET_SUCCEEDED.CLICK_HERE
    }}</Link>
  </p>

  <ErrorMessage v-if="!validURL" class="error">
    {{ AUTH_COPY.RESET_PASSWORD.INVALID_URL }}
  </ErrorMessage>
  <ErrorMessage v-if="resetMutation.isError.value" class="error">
    {{ AUTH_COPY.RESET_PASSWORD.RESET_ERROR }}
  </ErrorMessage>
</template>

<style scoped>
.error {
  margin-top: var(--space-sm);
}
</style>
