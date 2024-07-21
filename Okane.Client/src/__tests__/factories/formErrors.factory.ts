// Internal
import { capitalize } from '@shared/utils/string.utils'

/**
 * Given some form state, generate an object with matching keys and values set to '<key> error'.
 *
 * @param formState
 */
export function createStubFormErrors<TForm extends Record<string, unknown>>(
  formState: TForm,
): Record<keyof TForm, string> {
  return Object.keys(formState).reduce(
    (errors, key) => {
      const formKey = key as keyof TForm

      return {
        ...errors,
        [formKey]: `${formKey.toString()} error`,
      }
    },
    {} as Record<keyof TForm, string>,
  )
}

/**
 * Given some form state, generate an object with capitalized keys and values set to ['<key> error'].
 *
 * @param formState
 */
export function createStubAPIFormErrors<TForm extends Record<string, unknown>>(
  formState: TForm,
): Record<string, string[]> {
  return Object.keys(formState).reduce((errors, key) => {
    return {
      ...errors,
      [capitalize(key)]: [`${key} error`],
    }
  }, {})
}
