# Success - non-paginated
```json
{
  "items": [],
  "status": 200
}
```

# Success - paginated
```json
{
  "items": [],
  "status": 200,
  "currentPage": 0,
  "totalItems": 99,
  "hasNextPage": true
}
```

# Error - non-validation
```json
{
  "status": 400,
  "type": "https://datatracker.ietf.org/doc/html/rfc9110#name-400-bad-request",
  "title": "Bad Input",
  "detail": "Negative numbers not allowed",
  
  // Optional
  "instance": "/api/posts/1",
  "stackTrace": "only-available-during-development"
}
```

# Error - validation
As above, but with an "errors" property:
```json
{
  "errors": {
    "firstName": ["FirstName is required", "FirstName must be at least 5 characters."]
  }
}
```
