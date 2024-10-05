<script setup lang="ts">
// External
import { onMounted, useTemplateRef } from 'vue'

// Internal
import ModalActions from '@shared/components/modal/ModalActions.vue'

import { SHARED_COPY } from '@shared/constants/copy'

type Props = {
  handleClose: () => void
  handleDelete: () => void
}

const props = defineProps<Props>()
const deleteButtonRef = useTemplateRef<HTMLButtonElement>('deleteButtonRef')

onMounted(() => {
  deleteButtonRef.value?.focus()
})
</script>

<template>
  <ModalActions>
    <button ref="deleteButtonRef" @click="props.handleDelete">
      {{ SHARED_COPY.ACTIONS.DELETE }}
    </button>
    <button @click="props.handleClose">{{ SHARED_COPY.ACTIONS.CANCEL }}</button>
  </ModalActions>
</template>
