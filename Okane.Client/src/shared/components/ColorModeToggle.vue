<script setup lang="ts">
// External
import { computed } from 'vue'
import { useDark } from '@vueuse/core'

// Internal
import { SHARED_COPY } from '@shared/constants/copy'

const isDark = useDark({
  storageKey: 'okane-color-mode',
})

const text = computed(() => {
  if (isDark.value) return SHARED_COPY.ACTIONS.SWITCH_TO_LIGHT_MODE
  return SHARED_COPY.ACTIONS.SWITCH_TO_DARK_MODE
})

function toggleColorMode() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button @click="toggleColorMode">{{ text }}</button>
</template>
