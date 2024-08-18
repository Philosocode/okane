// External
import { type DefaultBodyType, type HttpResponseResolver, type PathParams } from 'msw'

type Predicate = (searchParams: URLSearchParams) => boolean

export function withSearchParams<
  Params extends PathParams,
  RequestBodyType extends DefaultBodyType,
  ResponseBodyType extends DefaultBodyType,
>(
  predicate: Predicate,
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>,
): HttpResponseResolver<Params, RequestBodyType, ResponseBodyType> {
  return (args) => {
    const { request } = args
    const url = new URL(request.url)
    const searchParams = new URLSearchParams(url.search)

    if (predicate(searchParams)) return resolver(args)
  }
}
