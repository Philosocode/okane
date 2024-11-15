<script setup lang="ts">
// External
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'

// Internal
import AuthFormWrapper from '@features/auth/components/AuthForm.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import Heading from '@shared/components/Heading.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'
import { ROUTE_NAME } from '@shared/services/router/router'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

const authStore = useAuthStore()
const router = useRouter()

const formState = ref({
  email: '',
  password: '',
})

const formIsValid = computed<boolean>(() => !!formState.value.email && !!formState.value.password)
const submitFailed = ref(false)

async function handleSubmit() {
  try {
    await authStore.login(formState.value.email, formState.value.password)
    await router.push({ name: ROUTE_NAME.FINANCES })
  } catch (err) {
    console.error('Error logging in:', err)
    submitFailed.value = true
  }
}
</script>

<template>
  <Heading tag="h1">{{ AUTH_COPY.AUTH_FORM.LOGIN }}</Heading>
  <AuthFormWrapper
    :submit-button-is-disabled="!formIsValid"
    :submit-button-text="AUTH_COPY.AUTH_FORM.LOGIN"
    :submit-error="submitFailed ? AUTH_COPY.AUTH_FORM.LOGIN_ERROR : ''"
    @submit="handleSubmit"
  >
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
  </AuthFormWrapper>
</template>
