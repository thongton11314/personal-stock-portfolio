---
title: "API Design Patterns"
type: concept
created: 2026-04-13
updated: 2026-04-13
tags: [api, patterns, conventions]
sources: [rest-api-design-best-practices.md]
related: [rest, http-status-codes]
status: active
---

# API Design Patterns

Reusable patterns for designing consistent, developer-friendly APIs.

## Error Handling

Return structured error responses with:
- `error.code` — machine-readable error code (e.g. `VALIDATION_ERROR`).
- `error.message` — human-readable description.
- `error.details[]` — field-level errors with `field` and `reason`.

(Source: [[rest-api-design-best-practices]])

## Pagination

Two approaches:

| Approach | Pros | Cons |
|----------|------|------|
| **Cursor-based** | Efficient at scale, stable under inserts | More complex to implement |
| **Offset-based** | Simple, familiar | Slow on large datasets (`OFFSET` queries) |

**Prefer cursor-based** for production APIs. Return `next_cursor` and `has_more` in response.

(Source: [[rest-api-design-best-practices]])

## Versioning

| Approach | Pros | Cons |
|----------|------|------|
| **URL path** (`/v1/`) | Explicit, easy to test | Less "pure" REST |
| **Header-based** | More RESTful | Harder to discover and debug |

**Prefer URL path versioning** for practical reasons.

(Source: [[rest-api-design-best-practices]])

## Authentication

- Use `Authorization: Bearer <token>` header.
- Never pass tokens as query parameters (appear in logs and browser history).

## Rate Limiting

- Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.
- Return `429 Too Many Requests` when exceeded.
- Plan for rate limiting from day one.

## See Also

- [[rest]] — core REST principles.
- [[http-status-codes]] — standard codes and usage.
