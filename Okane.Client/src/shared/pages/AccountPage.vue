<script setup lang="ts">
// Internal
import DeleteAccountModal from '@features/auth/components/accountPage/DeleteAccountModal.vue'
import EditName from '@features/auth/components/accountPage/EditName.vue'
import EditPassword from '@features/auth/components/accountPage/EditPassword.vue'
import Heading from '@shared/components/nav/Heading.vue'
import HorizontalDivider from '@shared/components/divider/HorizontalDivider.vue'
import PageLayout from '@shared/components/wrapper/PageLayout.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'

const { data: requirements, isError } = useQueryPasswordRequirements()
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ AUTH_COPY.ACCOUNT }}</Heading>
    <div v-if="requirements" class="column flow">
      <section class="row">
        <EditPassword class="edit-password" :requirements="requirements" />
        <EditName class="edit-name" />
      </section>
      <HorizontalDivider />
      <DeleteAccountModal />
    </div>
    <ErrorMessage v-if="isError">{{ AUTH_COPY.PASSWORD_REQUIREMENTS.FETCH_ERROR }}</ErrorMessage>
  </PageLayout>
</template>

<style scoped lang="scss">
.column {
  --flow-space: var(--space-lg);
}

.edit-name {
  @include respond(sm) {
    align-self: start;
  }
}

.edit-password {
  @include respond(sm) {
  }
}

.row {
  display: grid;
  gap: var(--space-md);

  @include respond(sm) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
