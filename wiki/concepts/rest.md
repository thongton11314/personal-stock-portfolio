---
title: "REST"
type: concept
created: 2026-04-13
updated: 2026-04-13
tags: [api, architecture, web]
sources: [rest-api-design-best-practices.md]
related: [api-design-patterns, http-status-codes]
status: active
---

# REST

Representational State Transfer — an architectural style for networked applications. The dominant style for web APIs.

## Core Principles

- **Stateless** — each request contains all information needed to process it.
- **Resource-oriented** — URLs represent resources (nouns), HTTP methods represent actions.
- **Uniform interface** — standard methods (GET, POST, PUT, PATCH, DELETE) with predictable semantics.
- **Layered system** — clients don't need to know whether they're connected to the end server or an intermediary.

## Key Conventions

- Plural nouns for collections: `/users`, `/orders`.
- Nesting for relationships: `/users/{id}/orders` (max 3 levels).
- Kebab-case for multi-word paths: `/order-items`.
- Standard HTTP status codes for responses.

(Source: [[rest-api-design-best-practices]])

## See Also

- [[api-design-patterns]] — broader design patterns including error handling, pagination, versioning.
- [[http-status-codes]] — standard status code usage.
