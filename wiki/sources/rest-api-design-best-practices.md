---
title: "REST API Design Best Practices"
type: source
created: 2026-04-13
updated: 2026-04-13
tags: [api, rest, design, http]
sources: [rest-api-design-best-practices.md]
related: [rest, api-design-patterns, http-status-codes]
status: active
---

# REST API Design Best Practices

**Author**: Sarah Chen
**Date**: 2026-03-15
**Source file**: `raw/rest-api-design-best-practices.md`

## Key Claims

- Use nouns (plural) for URL paths, nest for relationships, max 3 levels deep.
- Use standard HTTP methods with correct idempotency expectations.
- Return structured error responses with error code, message, and field-level details.
- Prefer cursor-based pagination over offset-based for performance at scale.
- Use URL path versioning (`/v1/`) over header-based versioning for discoverability.
- Never pass auth tokens as query parameters — use `Authorization: Bearer` header.
- Include rate limit headers (`X-RateLimit-*`) and return `429` when exceeded.

## Notable Quotes

> "Consistency matters more than perfection — pick conventions and stick to them."

> "Design for the consumer, not the database schema."

## Relevance

Foundational reference for [[api-design-patterns]]. Establishes conventions for [[rest]] API structure, error handling, pagination, and authentication that can be adopted as project-wide standards.

(Source: [[rest-api-design-best-practices]])
