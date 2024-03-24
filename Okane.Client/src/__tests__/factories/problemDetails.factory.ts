// Internal
import { HTTPStatusCode } from '@/shared/constants/http.constants'

import type { ProblemDetails } from '@/shared/services/apiClient/apiClient.types'

import { baseMockFactory } from '@/tests/factories/base.factory'

const defaultProblemDetails: ProblemDetails = {
  detail: 'An exception occurred while editing a finance record.',
  instance: '/api/finance-records/1',
  status: HTTPStatusCode.BadRequest,
  title: 'Bad Request',
  type: 'https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.1',
}

export function createMockProblemDetails() {
  return baseMockFactory.bind(null, defaultProblemDetails)
}
