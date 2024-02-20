GET {{BASE_URL}}/health
HTTP 200
[Asserts]
body contains "Healthy"
