export function stripSearchParams(url: string) {
  const questionIndex = url.indexOf('?')
  if (questionIndex === -1) return url
  return url.slice(0, questionIndex)
}
