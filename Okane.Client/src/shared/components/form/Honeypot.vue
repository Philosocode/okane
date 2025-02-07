<script setup lang="ts">
// Internal
import { getUniqueFormControlId } from '@shared/utils/form'

import { HONEYPOT_INPUT_NAME } from '@shared/constants/form'
import { SHARED_COPY } from '@shared/constants/copy'

const controlId = getUniqueFormControlId()
const model = defineModel<string>()
</script>

<template>
  <div style="position: absolute; left: -9999px">
    <label :for="controlId">{{ SHARED_COPY.NOUNS.CITY }}</label>
    <input
      autocomplete="nope"
      :id="controlId"
      :name="HONEYPOT_INPUT_NAME"
      tabindex="-1"
      type="text"
      v-model="model"
    />
  </div>
</template>
