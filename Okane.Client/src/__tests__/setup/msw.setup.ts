// Internal
import { mockServer } from '@tests/msw/mockServer'

beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  mockServer.resetHandlers()
})

afterAll(() => {
  mockServer.close()
})
