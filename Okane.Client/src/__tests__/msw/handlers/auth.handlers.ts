// External
import { http, HttpResponse, RequestHandler } from 'msw'

// Internal
import { server } from '@/tests/msw/server'

const authHandlers: RequestHandler[] = [
  http.post('/auth/register', () => {
    return HttpResponse.json({
      items: [],
    })
  }),
]

export function setUpAuthHandlers() {
  server.use(...authHandlers)
}
