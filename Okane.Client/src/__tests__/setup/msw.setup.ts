// Internal
import { testServer } from '@tests/msw/testServer'

beforeAll(() => {
  testServer.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  testServer.resetHandlers()
})

afterAll(() => {
  testServer.close()
})
