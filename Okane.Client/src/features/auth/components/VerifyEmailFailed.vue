<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import Button from '@shared/components/Button.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useSendVerificationEmail } from '@features/auth/composables/useSendVerificationEmail'

type Props = {
  email: string
}

const props = defineProps<Props>()

const sendEmailMutation = useSendVerificationEmail()
const sentEmailSuccessfully = ref(false)

function reSendVerificationEmail() {
  sendEmailMutation.mutate(
    { email: props.email },
    {
      onSuccess() {
        sentEmailSuccessfully.value = true
      },
      onError(err) {
        console.error(err)
      },
    },
  )
}
</script>

<template>
  <p :class="{ 'body-text': true, error: sendEmailMutation.isError.value }">
    <template v-if="!sentEmailSuccessfully && !sendEmailMutation.isError.value">
      {{ AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.FAILED }}
      <Button @click="reSendVerificationEmail">
        {{ AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.CLICK_HERE }}
      </Button>
      {{ AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.RESEND }}
    </template>

    <template v-if="sentEmailSuccessfully">
      {{ AUTH_COPY.VERIFY_EMAIL.SEND_VERIFICATION_EMAIL.SUCCESS }}
    </template>

    <template v-if="sendEmailMutation.isError.value">
      {{ AUTH_COPY.VERIFY_EMAIL.SEND_VERIFICATION_EMAIL.ERROR }}
    </template>
  </p>
</template>

<style scoped>
.error {
  color: var(--color-error);
}
</style>
