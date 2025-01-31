<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/components/wrappers/PageLayout.vue'
import SendResetPasswordEmailForm from '@features/auth/components/SendResetPasswordEmailForm.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

const sendSucceeded = ref(false)
</script>

<template>
  <PageLayout is-narrow>
    <SendResetPasswordEmailForm v-if="!sendSucceeded" @success="sendSucceeded = true" />

    <template v-else>
      <Heading tag="h1">{{ AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.SUCCESS.HEADING }}</Heading>
      <p>{{ AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.SUCCESS.BODY }}</p>
    </template>
  </PageLayout>
</template>
