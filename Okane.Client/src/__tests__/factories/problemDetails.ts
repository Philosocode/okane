// Internal
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import type { ProblemDetails } from '@shared/services/apiClient/types'

import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'

const defaultProblemDetails: ProblemDetails = {
  detail: 'An exception occurred while editing a finance record.',
  instance: '/api/finance-records/1',
  status: HTTP_STATUS_CODE.BAD_REQUEST_400,
  title: 'Bad Request',
  type: 'https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.1',
}

export const createTestProblemDetails: TestObjectFactoryFunction<ProblemDetails> = (
  overrides,
  options,
) => {
  return baseTestObjectFactory(defaultProblemDetails, overrides, options)
}
