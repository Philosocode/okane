<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import PageLayout from '@shared/layouts/PageLayout.vue'
import RegisterForm from '@features/auth/components/RegisterForm.vue'
import SuccessfullyRegistered from '@features/auth/components/SuccessfullyRegistered.vue'

const registrationSucceeded = ref(false)
</script>

<template>
  <PageLayout>
    <template v-if="!registrationSucceeded">
      <RegisterForm @succeeded="() => (registrationSucceeded = true)" />
    </template>
    <template v-else>
      <SuccessfullyRegistered />
    </template>
  </PageLayout>
</template>
