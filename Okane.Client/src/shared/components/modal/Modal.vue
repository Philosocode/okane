<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, watch } from 'vue'

// Internal
import { SHARED_COPY } from '@shared/constants/copy'

// Internal
type Props = {
  isShowing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

function emitModalClose() {
  emit('close')
}

function handleOutsideClick(event: Event) {
  const target = event.target as HTMLDialogElement
  if (target.nodeName === 'DIALOG') {
    emitModalClose()
  }
}

watch(
  () => props.isShowing,
  () => {
    if (props.isShowing) {
      // "?." is needed because jsdom doesn't support dialogs. Dialog methods won't be present when
      // running tests.
      dialogRef.value?.showModal?.()
    } else {
      dialogRef.value?.close?.()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <dialog @close="emitModalClose" @mousedown="handleOutsideClick" class="modal" ref="dialogRef">
      <div class="modal-content" v-if="props.isShowing">
        <button class="close-button" @click="emitModalClose">
          <FontAwesomeIcon icon="fa-solid fa-xmark" :title="SHARED_COPY.MODAL.CLOSE_MODAL" />
        </button>
        <slot />
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped lang="scss">
.close-button {
  border: none;
  border-radius: 100%;

  height: 2rem;
  width: 2rem;

  position: absolute;
  right: 0.25rem;
  top: 0.25rem;
}

.modal {
  border: none;
  border-radius: 0.5rem;
  padding: 0;

  width: 100%;
  max-width: pxToRem(400);

  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.modal::backdrop {
  background: rgba(0, 0, 0, 50%);
}

.modal-content {
  padding: 1rem;

  &>*+* {
    margin-top: var(--space-sm);
  }
}
</style>
