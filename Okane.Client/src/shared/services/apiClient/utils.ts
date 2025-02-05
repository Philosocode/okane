// Internal
import type { FormErrors } from '@shared/types/form'

import { capitalize } from '@shared/utils/string'
import { objectHasKey } from '@shared/utils/object'

export function getFormErrorsFromApiResponse<TForm extends Record<string, unknown>>(
  apiErrors: Record<string, unknown>,
  formState: TForm,
): FormErrors<TForm> {
  const formKeys = Object.keys(formState) as (keyof TForm)[]

  return formKeys.reduce((errors, formKey) => {
    errors[formKey] = ''

    // The API returns JSON fields in PascalCase.
    // e.g. If the JS form key is "amount", the API will return an object with the key "Amount".
    // We need to widen the type of formKey so it can be passed to capitalize.
    const capitalizedKey = capitalize(formKey as string)

    if (
      objectHasKey(apiErrors, capitalizedKey) &&
      Array.isArray(apiErrors[capitalizedKey]) &&
      apiErrors[capitalizedKey].length >= 1
    ) {
      // TODO: Add support for setting multiple errors per key.
      errors[formKey] = apiErrors[capitalizedKey][0]
    }

    return errors
  }, {} as FormErrors<TForm>)
}
