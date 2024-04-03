// Internal
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { testServer } from '@tests/msw/testServer'

beforeAll(() => {
  testServer.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  testQueryClient.clear()
  testServer.resetHandlers()
})

afterAll(() => {
  testServer.close()
})
