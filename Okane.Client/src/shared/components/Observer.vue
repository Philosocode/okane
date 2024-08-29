<script setup lang="ts">
// External
import { watchDebounced } from '@vueuse/core'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

// Internal
import { DEFAULT_DEBOUNCE_DELAY } from '@shared/constants/request'

type Props = {
  options?: IntersectionObserverInit

  // When this dep changes and the observerElement is visible, re-emit a 'change' event.
  watchDep?: Ref<unknown>
  watchDebounceDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  watchDebounceDelay: DEFAULT_DEBOUNCE_DELAY,
})

const emit = defineEmits<{
  (e: 'change', isIntersecting: boolean): void
}>()

const isIntersecting = ref(false)
const observer = ref<IntersectionObserver>()
const observerElement = ref<HTMLSpanElement>()

onMounted(() => {
  observer.value = new IntersectionObserver(([entry]) => {
    isIntersecting.value = Boolean(entry?.isIntersecting)
  }, {})

  if (observerElement.value) observer.value.observe(observerElement.value)
})

watchDebounced(
  [isIntersecting, () => props.watchDep?.value],
  () => {
    if (isIntersecting.value) emit('change', isIntersecting.value)
  },
  { debounce: props.watchDebounceDelay },
)

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<template>
  <span class="observer" ref="observerElement" />
</template>
