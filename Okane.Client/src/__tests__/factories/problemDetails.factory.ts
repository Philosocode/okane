// Internal
import { HTTP_STATUS_CODE } from '@shared/constants/http.constants'

import type { ProblemDetails } from '@shared/services/apiClient/apiClient.types'

import { baseStubFactory, type StubFactoryFunction } from '@tests/factories/base.factory'

const defaultProblemDetails: ProblemDetails = {
  detail: 'An exception occurred while editing a finance record.',
  instance: '/api/finance-records/1',
  status: HTTP_STATUS_CODE.BAD_REQUEST_400,
  title: 'Bad Request',
  type: 'https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.1',
}

export const createStubProblemDetails: StubFactoryFunction<ProblemDetails> = (
  overrides,
  options,
) => {
  return baseStubFactory(defaultProblemDetails, overrides, options)
}
