<script setup lang="ts">
// External
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Internal
import FormInput from '@/features/forms/FormInput.vue'
import PageLayout from '@/shared/layouts/PageLayout.vue'

import { RouteName } from '@/features/navigation/router.constants'

import { useAuthStore } from '@/features/auth/useAuthStore'

import { isValidPassword } from '@/features/auth/auth.utils'
import { omitObjectKeys } from '@/shared/utils/object.utils'

const authStore = useAuthStore()
const router = useRouter()

const formState = ref({
  email: '',
  name: '',
  password: '',
  passwordConfirm: '',
})

const formIsValid = computed<boolean>(() => {
  const { email, name, password, passwordConfirm } = formState.value
  const validations = [
    Boolean(email),
    Boolean(name),
    Boolean(password),
    Boolean(passwordConfirm),
    password == passwordConfirm,
    isValidPassword(password)[0],
  ]

  return !validations.includes(false)
})

async function handleSubmit() {
  if (!formIsValid.value) return
  const postData = omitObjectKeys(formState.value, ['passwordConfirm'])
  try {
    await authStore.register(postData.email, postData.name, postData.password)
    await router.push({ name: RouteName.LoginPage })
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <PageLayout>
    <h1>Register</h1>

    <form @submit.prevent="handleSubmit">
      <fieldset>
        <FormInput label="Name" name="name" type="text" v-model="formState.name" />
        <FormInput label="Email" name="email" type="email" v-model="formState.email" />
        <FormInput label="Password" name="password" type="password" v-model="formState.password" />
        <FormInput
          label="Confirm password"
          name="passwordConfirm"
          type="password"
          v-model="formState.passwordConfirm"
        />
        <button :disabled="!formIsValid" type="submit">Register</button>
      </fieldset>
    </form>
  </PageLayout>
</template>

<style scoped>
fieldset {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 12rem;
}
</style>
@/shared/services/router@/features/auth/utils/auth
@/features/auth/utils/auth.utils@/features/auth/stores/auth.store@/features/auth/useAuthStore
@/features/navigation/services/router.service@/shared/utils/object.utils
