# Unhandled errors
The GlobalExceptionHandler is responsible for dealing with all unhandled exceptions. It returns 
`ProblemDetails` with a status code of 500 by default. Error responses will have the following 
format:
```json
{
  "status": 400,
  "type": "https://datatracker.ietf.org/doc/html/rfc9110#name-400-bad-request",
  "title": "Bad Input",
  "detail": "Negative numbers not allowed",

  // Optional fields.
  "instance": "/api/posts/1",
  "stackTrace": "available-during-development"
}
```

# Handled errors
## Errors in handlers
Errors should be generated using `TypedResults.*`. When using a different `TypedResults` method, 
e.g. `TypedResults.BadRequest`, ensure a `ProblemDetails` is passed to the method call.

## Validation errors in handlers
Use `TypedResults.ValidationProblem` or the custom `ApiValidationException` class.

## Errors in other contexts
Errors that the user can't handle (e.g. database errors, network errors, bugs in code) will 
be caught by the global exception handler and returned to the client with a 5XX status code. 

If the error is something that the user has control over, an error response with a 4XX status code 
will be returned.  In this case, a custom Exception can be thrown that can be handled by either:
- an HTTP handler
- the global exception handler, which should be set up to convert the custom Exceptions into 
  `ProblemDetails`
