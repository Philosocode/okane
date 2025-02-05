<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import AppButton from '@shared/components/AppButton.vue'
import IconButton from '@shared/components/IconButton.vue'

import { useModalTriggerStore } from '@shared/composables/useModalTriggerStore'

type Props = {
  isIcon?: boolean
}

const props = defineProps<Props>()

type HasButtonRef = {
  buttonRef: HTMLButtonElement | null
}

const triggerRef = ref<HasButtonRef>()
const triggerStore = useModalTriggerStore()

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  triggerStore.setModalTrigger(triggerRef.value?.buttonRef ?? null)
  emit('click')
}
</script>

<template>
  <component
    :is="props.isIcon ? IconButton : AppButton"
    ref="triggerRef"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </component>
</template>
