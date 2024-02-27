type ErrorWithMessage = {
  message: string
}

// See: https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}
