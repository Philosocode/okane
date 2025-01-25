<script setup lang="ts">
// External
import { computed, onMounted, onUnmounted, ref } from 'vue'

// Internal
import IconButton from '@shared/components/IconButton.vue'

import { SHARED_COPY } from '@shared/constants/copy'
import {
  ERROR_TOAST_ATTRIBUTES,
  SUCCESS_TOAST_ATTRIBUTES,
  TOAST_HIDE_AFTER_MS,
} from '@shared/constants/toast'

import { type Toast as ToastType } from '@shared/types/toaster'

import { useToastStore } from '@shared/composables/useToastStore'

type Props = {
  toast: ToastType
}
const props = defineProps<Props>()
const timeout = ref<number>()

const { removeToast } = useToastStore()
const toastAttributes = computed(() => {
  if (props.toast.type === 'error') {
    return { ...ERROR_TOAST_ATTRIBUTES, class: 'is-error' }
  }

  return SUCCESS_TOAST_ATTRIBUTES
})

onMounted(() => {
  timeout.value = setTimeout(() => {
    removeToast(props.toast.id)
  }, TOAST_HIDE_AFTER_MS)
})

onUnmounted(() => {
  clearTimeout(timeout.value)
})
</script>

<template>
  <div class="toast" v-bind="toastAttributes">
    <p>{{ props.toast.text }}</p>

    <IconButton
      class="dismiss-button"
      :title="SHARED_COPY.ACTIONS.DISMISS"
      icon="fa-solid fa-xmark"
      @click="removeToast(props.toast.id)"
    />
  </div>
</template>

<style scoped>
.dismiss-button {
  right: 0;
  top: 0;
  position: absolute;
}

.toast {
  background-color: var(--color-bg-dim);
  border-radius: 4px;
  padding: var(--space-sm) var(--space-md);
  position: relative;
}

.is-error {
  background-color: var(--color-error-dim);
}
</style>
