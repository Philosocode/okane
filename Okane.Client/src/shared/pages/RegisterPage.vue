<script setup lang="ts">
// External
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Internal
import FormInput from '@/features/forms/components/FormInput.vue'
import PageLayout from '@/shared/layouts/PageLayout.vue'

import { RouteName } from '@/features/navigation/router'

import { isValidPassword } from '@/features/auth/utils/authUtils'
import { omitObjectKeys } from '@/shared/utils/objectUtils'

import { APIClient } from '@/shared/services/APIClient'

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
    await APIClient.post('/auth/register', postData)
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
