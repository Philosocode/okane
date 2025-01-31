<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import PageLayout from '@shared/components/wrappers/PageLayout.vue'
import RegisterForm from '@features/auth/components/RegisterForm.vue'
import SuccessfullyRegistered from '@features/auth/components/SuccessfullyRegistered.vue'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

const registrationSucceeded = ref(false)

const { data: passwordRequirements } = useQueryPasswordRequirements()

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
  </PageLayout>
</template>
