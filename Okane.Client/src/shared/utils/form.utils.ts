// External
import { ref } from 'vue'

const formIdRef = ref(0)

/**
 * Return a unique value that can be used for a form control.
 *
 * @returns Unique form control ID.
 */
export function getUniqueFormId() {
  formIdRef.value++
  return String(formIdRef.value)
}
