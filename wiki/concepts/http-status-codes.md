---
title: "HTTP Status Codes"
type: concept
created: 2026-04-13
updated: 2026-04-13
tags: [http, api, reference]
sources: [rest-api-design-best-practices.md]
related: [rest, api-design-patterns]
status: active
---

# HTTP Status Codes

Standard status codes for REST API responses.

## Success (2xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200  | OK | Successful GET, PUT, PATCH |
| 201  | Created | Successful POST that creates a resource |
| 204  | No Content | Successful DELETE |

## Client Error (4xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400  | Bad Request | Malformed request, validation error |
| 401  | Unauthorized | Missing or invalid authentication |
| 403  | Forbidden | Valid auth but insufficient permissions |
| 404  | Not Found | Resource doesn't exist |
| 409  | Conflict | Duplicate or state conflict |
| 422  | Unprocessable Entity | Semantic validation failure |
| 429  | Too Many Requests | Rate limit exceeded |

## Server Error (5xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| 500  | Internal Server Error | Unexpected server failure |

(Source: [[rest-api-design-best-practices]])

## See Also

- [[rest]] — core REST architecture.
- [[api-design-patterns]] — error handling, pagination, versioning patterns.
