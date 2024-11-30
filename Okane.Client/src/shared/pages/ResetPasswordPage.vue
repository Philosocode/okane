<script setup lang="ts">
// Internal
import PageLayout from '@shared/layouts/PageLayout.vue'
import ResetPasswordForm from '@features/auth/components/ResetPasswordForm.vue'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

const { data: requirements } = useQueryPasswordRequirements()
</script>

<template>
  <PageLayout>
    <ResetPasswordForm v-if="requirements" :requirements="requirements" />
  </PageLayout>
</template>
