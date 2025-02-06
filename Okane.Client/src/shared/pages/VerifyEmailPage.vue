<script setup lang="ts">
// External
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

// Internal
import AppButton from '@shared/components/button/AppButton.vue'
import Heading from '@shared/components/nav/Heading.vue'
import Loader from '@shared/components/loader/Loader.vue'
import PageLayout from '@shared/components/wrapper/PageLayout.vue'
import VerifyEmailFailed from '@features/auth/components/verifyEmail/VerifyEmailFailed.vue'
import VerifyEmailSucceeded from '@features/auth/components/verifyEmail/VerifyEmailSucceeded.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useVerifyEmail } from '@features/auth/composables/useVerifyEmail'

const attemptedToVerify = ref(false)

const route = useRoute()

const params = computed(() => {
  let { email, token } = route.query

  if (typeof email !== 'string') email = ''
  if (typeof token !== 'string') token = ''

  return { email, token }
})

const verifyMutation = useVerifyEmail()

function verifyEmail() {
  verifyMutation.mutate(
    {
      email: params.value.email,
      token: params.value.token,
    },
    {
      onSettled() {
        attemptedToVerify.value = true
      },
    },
  )
}
</script>

<template>
  <PageLayout is-narrow>
    <Heading tag="h1">{{ AUTH_COPY.VERIFY_EMAIL.HEADING }}</Heading>

    <p v-if="!params.email">{{ AUTH_COPY.VERIFY_EMAIL.MISSING_EMAIL }}</p>

    <VerifyEmailFailed v-else-if="!params.token" :email="params.email" />

    <template v-else-if="!attemptedToVerify">
      <div class="row">
        <AppButton variant="callToAction" @click="verifyEmail">{{
          AUTH_COPY.VERIFY_EMAIL.CLICK_TO_VERIFY
        }}</AppButton>
        <Loader v-if="verifyMutation.isPending.value" />
      </div>
    </template>

    <VerifyEmailFailed v-else-if="verifyMutation.isError.value" :email="params.email" />
    <VerifyEmailSucceeded v-else />
  </PageLayout>
</template>

<style scoped>
.row {
  display: flex;
  gap: var(--space-md);
}
</style>
