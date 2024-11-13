<script setup lang="ts">
// Internal
import Heading from '@shared/components/Heading.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { type PasswordChecks } from '@features/auth/types/authForm'

const copy = AUTH_COPY.AUTH_FORM.PASSWORD_REQUIREMENTS

type Props = {
  checks: PasswordChecks
  minPasswordLength: number
}

const props = defineProps<Props>()
</script>

<template>
  <div>
    <Heading tag="h3" class="heading">{{ copy.HEADING }}</Heading>
    <ul class="list">
      <li v-if="props.checks.insufficientLength">{{ copy.MIN_LENGTH(props.minPasswordLength) }}</li>
      <li v-if="props.checks.missingUppercase">
        {{ copy.UPPERCASE_LETTER }}
      </li>
      <li v-if="props.checks.missingLowercase">
        {{ copy.LOWERCASE_LETTER }}
      </li>
      <li v-if="props.checks.missingDigit">
        {{ copy.DIGIT }}
      </li>
      <li v-if="props.checks.missingNonAlphanumeric">
        {{ copy.NON_ALPHANUMERIC_SYMBOL }}
      </li>
      <li v-if="props.checks.invalidPasswordConfirm">
        {{ copy.MATCHING_PASSWORDS }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.heading {
  font-size: var(--font-size-md);
  margin-block: 0;
}

.list {
  list-style-type: disc;

  /* TODO: Add consistent list spacing. */
  padding-left: var(--space-md);
}
</style>
