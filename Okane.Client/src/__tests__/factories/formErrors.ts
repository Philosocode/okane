// Internal
import { capitalize } from '@shared/utils/string'

/**
 * Given some form state, generate an object with capitalized keys and values set to ['<key> error'].
 *
 * @param formState
 */
export function createTestAPIFormErrors<TForm extends Record<string, unknown>>(
  formState: TForm,
): Record<string, string[]> {
  return Object.keys(formState).reduce((errors, key) => {
    return {
      ...errors,
      [capitalize(key)]: [`${key} error`],
    }
  }, {})
}
