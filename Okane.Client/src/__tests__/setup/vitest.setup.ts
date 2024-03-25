// External
import { createPinia, type Pinia, setActivePinia } from 'pinia'

// Internal
import { mockServer } from '@tests/msw/mockServer'

beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  global.pinia = pinia
})

afterEach(() => {
  delete global.pinia
  mockServer.resetHandlers()
})

afterAll(() => {
  mockServer.close()
})

declare global {
  // eslint-disable-next-line no-var
  var pinia: Pinia | undefined
}
