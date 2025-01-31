<script setup lang="ts">
// Internal
import Button from '@shared/components/Button.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'

import { SHARED_COPY } from '@shared/constants/copy'

type Props = {
  handleClose: () => void
  handleDelete: () => void
}

const props = defineProps<Props>()
</script>

<template>
  <ModalActions>
    <Button focus-on-mount variant="warning" @click="props.handleDelete">
      {{ SHARED_COPY.ACTIONS.DELETE }}
    </Button>
    <Button @click="props.handleClose">{{ SHARED_COPY.ACTIONS.CANCEL }}</Button>
  </ModalActions>
</template>
