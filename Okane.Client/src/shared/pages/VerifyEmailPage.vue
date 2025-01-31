<script setup lang="ts">
// External
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'

// Internal
import Heading from '@shared/components/Heading.vue'
import Loader from '@shared/components/loader/Loader.vue'
import PageLayout from '@shared/components/wrappers/PageLayout.vue'
import VerifyEmailFailed from '@features/auth/components/VerifyEmailFailed.vue'
import VerifyEmailSucceeded from '@features/auth/components/VerifyEmailSucceeded.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useVerifyEmail } from '@features/auth/composables/useVerifyEmail'

const route = useRoute()

const params = computed(() => {
  let { email, token } = route.query

  if (typeof email !== 'string') email = ''
  if (typeof token !== 'string') token = ''

  return { email, token }
})

const doneInitialLoad = ref(false)
const verifyMutation = useVerifyEmail()

onMounted(() => {
  const { email, token } = params.value

  if (email && token) {
    verifyEmail()
  } else {
    doneInitialLoad.value = true
  }
})

function verifyEmail() {
  verifyMutation.mutate(
    {
      email: params.value.email,
      token: params.value.token,
    },
    {
      onSettled() {
        doneInitialLoad.value = true
      },
    },
  )
}
</script>

<template>
  <PageLayout is-narrow>
    <Heading tag="h1">{{ AUTH_COPY.VERIFY_EMAIL.VERIFYING_YOUR_EMAIL }}</Heading>

    <template v-if="!doneInitialLoad">
      <p class="body-text">{{ AUTH_COPY.VERIFY_EMAIL.PLEASE_WAIT }}</p>
      <Loader />
    </template>

    <p v-else-if="!params.email" class="body-text">{{ AUTH_COPY.VERIFY_EMAIL.MISSING_EMAIL }}</p>

    <VerifyEmailFailed
      v-else-if="!params.token || verifyMutation.isError.value"
      :email="params.email"
    />

    <VerifyEmailSucceeded v-else />
  </PageLayout>
</template>

<style scoped>
.body-text {
  margin-bottom: var(--space-sm);
}
</style>
