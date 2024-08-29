// Internal
import * as utils from '@shared/services/apiClient/utils'

describe('getFormErrorsFromAPIResponse', () => {
  const formState = { a: 1, b: 2 }
  const errors = ['Bad request']

  test('sets formErrors[key] to the first error in apiErrors[Key]', () => {
    const apiErrors = { A: errors, B: [errors[0], 'Other error'] }
    const formErrors = utils.getFormErrorsFromAPIResponse(apiErrors, formState)

    expect(formErrors).toEqual({ a: apiErrors.A[0], b: apiErrors.B[0] })
  })

  test('sets an empty string if apiErrors[Key] is an empty array', () => {
    const apiErrors = { A: [] }
    const formErrors = utils.getFormErrorsFromAPIResponse(apiErrors, formState)

    expect(formErrors).toEqual({ a: '', b: '' })
  })

  test('ignores non-array apiErrors', () => {
    const apiErrors = { A: 'Bad request' }
    const formErrors = utils.getFormErrorsFromAPIResponse(apiErrors, formState)

    expect(formErrors).toEqual({ a: '', b: '' })
  })

  test('ignores keys present in apiErrors but not in formState', () => {
    const apiErrors = { C: errors }
    const formErrors = utils.getFormErrorsFromAPIResponse(apiErrors, formState)

    expect(formErrors).toEqual({ a: '', b: '' })
  })
})
