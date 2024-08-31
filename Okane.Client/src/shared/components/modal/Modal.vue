<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, watch } from 'vue'

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
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <dialog @close="emitModalClose" @mousedown="handleOutsideClick" class="modal" ref="dialogRef">
      <div class="modal-content">
        <button class="close-button" @click="emitModalClose">
          <FontAwesomeIcon icon="fa-solid fa-xmark" title="Close Modal" />
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
  top: 40%;
  transform: translate(-50%, -50%);
}

.modal::backdrop {
  background: rgba(0, 0, 0, 50%);
}

.modal-content {
  padding: 1rem;

  & > * + * {
    margin-top: var(--space-sm);
  }
}
</style>
