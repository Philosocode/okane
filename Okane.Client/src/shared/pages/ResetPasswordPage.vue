<script setup lang="ts">
// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import PageLayout from '@shared/components/wrapper/PageLayout.vue'
import ResetPasswordForm from '@features/auth/components/resetPassword/ResetPasswordForm.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

const { data: requirements, isError } = useQueryPasswordRequirements()
</script>

<template>
  <PageLayout is-narrow>
    <ResetPasswordForm v-if="requirements" :requirements="requirements" />
    <ErrorMessage v-if="isError">{{ AUTH_COPY.PASSWORD_REQUIREMENTS.FETCH_ERROR }}</ErrorMessage>
  </PageLayout>
</template>
