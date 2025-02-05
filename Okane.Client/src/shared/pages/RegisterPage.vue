<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import PageLayout from '@shared/components/wrapper/PageLayout.vue'
import RegisterForm from '@features/auth/components/RegisterForm.vue'
import SuccessfullyRegistered from '@features/auth/components/SuccessfullyRegistered.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

const registrationSucceeded = ref(false)

const { data: passwordRequirements, isError } = useQueryPasswordRequirements()

function setRegistrationSucceeded() {
  registrationSucceeded.value = true
}
</script>

<template>
  <PageLayout is-narrow>
    <RegisterForm
      v-if="!registrationSucceeded && passwordRequirements"
      :password-requirements="passwordRequirements"
      @success="setRegistrationSucceeded"
    />
    <SuccessfullyRegistered v-if="registrationSucceeded" />
    <ErrorMessage v-if="isError">{{ AUTH_COPY.PASSWORD_REQUIREMENTS.FETCH_ERROR }}</ErrorMessage>
  </PageLayout>
</template>
