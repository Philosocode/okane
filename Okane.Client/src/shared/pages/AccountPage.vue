<script setup lang="ts">
// Internal
import DeleteAccount from '@features/auth/components/DeleteAccountModal.vue'
import EditName from '@features/auth/components/EditName.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ AUTH_COPY.ACCOUNT_PAGE.HEADING }}</Heading>
    <EditName />
    <hr class="divider" />
    <DeleteAccount />
  </PageLayout>
</template>

<style scoped>
.divider {
  margin-block: var(--space-lg);
}
</style>
