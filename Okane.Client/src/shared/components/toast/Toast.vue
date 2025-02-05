<script setup lang="ts">
// External
import { computed, onMounted, onUnmounted, ref } from 'vue'

// Internal
import Card from '@shared/components/wrapper/Card.vue'
import IconButton from '@shared/components/button/IconButton.vue'

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

const isError = computed(() => props.toast.type === 'error')

const toastAttributes = computed(() => {
  if (isError.value) {
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
  <Card class="toast" v-bind="toastAttributes">
    <p>{{ props.toast.text }}</p>

    <IconButton
      :class="{ 'dismiss-button--error': isError }"
      :title="SHARED_COPY.ACTIONS.DISMISS"
      icon="fa-solid fa-xmark"
      @click="removeToast(props.toast.id)"
    />
  </Card>
</template>

<style scoped>
.toast {
  background-color: var(--color-site-bg);
  padding: var(--space-sm) var(--space-md);
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dismiss-button--error {
  &:hover,
  &:active,
  &:focus {
    background-color: var(--color-error);
  }
}

.is-error {
  background-color: var(--color-error-deep);
  border-color: var(--color-error);
}
</style>
