// External
import { ref } from 'vue'

// Internal
import type { FormErrors } from '@shared/types/form'

const formIdRef = ref(0)

/**
 * Return a unique value that can be used for a form control.
 *
 * @returns Unique form control ID.
 */
export function getUniqueFormControlId() {
  formIdRef.value++
  return String(formIdRef.value)
}

/**
 * Given a form state, create a form errors object.
 *
 * @param formState
 *
 * @returns Object with the same keys of formState and values set to empty strings.
 */
export function getInitialFormErrors<TForm extends Record<string, unknown>>(
  formState: TForm,
): FormErrors<TForm> {
  const formKeys = Object.keys(formState) as Array<keyof TForm>

  return formKeys.reduce(
    (errors, formKey) => ({
      ...errors,
      [formKey]: '',
    }),
    {} as FormErrors<TForm>,
  )
}
