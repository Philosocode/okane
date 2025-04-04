export enum HTTP_HEADER {
  CONTENT_TYPE = 'Content-Type',
  X_USER_EMAIL = 'X-User-Email',
}

export enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum HTTP_STATUS_CODE {
  OK_200 = 200,
  CREATED_201 = 201,
  NO_CONTENT_204 = 204,

  BAD_REQUEST_400 = 400,
  UNAUTHORIZED_401 = 401,
  FORBIDDEN_403 = 403,
  NOT_FOUND_404 = 404,
  TOO_MANY_REQUESTS_429 = 429,
}

export enum MIME_TYPE {
  JSON = 'application/json',
}
