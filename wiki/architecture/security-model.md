---
title: "Security Model"
type: architecture
created: 2026-04-14
updated: 2026-04-14
tags: [security, auth, authorization, phase-5]
sources: [raw/prompt.md]
related: [adr-005-auth, api-routes, system-architecture, user-roles]
status: final
phase: 5
lead: Agent 6 (QA/Test Engineer)
---

# Security Model

## Authentication

- **Mechanism**: JWT tokens (see [[adr-005-auth]])
- **Storage**: password hash (bcrypt, cost 10) in `data/settings.json`
- **Token lifetime**: 24 hours
- **Token storage**: client-side localStorage
- **Token validation**: on every admin API request via auth middleware

## Authorization Matrix

| Route Pattern | Auth Required | Access Level |
|--------------|:---:|------------|
| `/api/auth/*` | No | Login only |
| `/api/admin/*` | Yes (JWT) | Full CRUD |
| `/api/public/*` | No | Read-only, filtered |
| `/login` | No | Login page |
| `/admin/*` | Yes (redirect) | Admin UI |
| `/` | No | Public page |

## Data Protection

### Public/Private Data Separation

| Data | Admin API | Public API |
|------|:---------:|:----------:|
| Holding ticker | Yes | Yes (if isPublic=true, status=active) |
| Company name | Yes | Yes (filtered) |
| Market value | Yes | Yes (filtered) |
| Weight (%) | Yes | Yes (calculated server-side) |
| Gain/loss | Yes | Yes (filtered) |
| **Quantity** | Yes | **NEVER** |
| **Average cost** | Yes | **NEVER** |
| **Purchase date** | Yes | **NEVER** |
| Archived holdings | Yes | **NEVER** |
| Hidden holdings | Yes | **NEVER** |
| Settings (auth) | Yes | **NEVER** |

### Server-Side Enforcement
- Public API routes construct response objects explicitly — they never return raw holding data
- Quantity, averageCost, purchaseDate are excluded at the service layer, not just hidden in the UI
- A code review checkpoint: grep for `quantity` in public route handlers; it must never appear

### Unpublished Page Protection
- When `settings.publicPage.isPublished === false`, public API routes return 404
- The check happens at the route level, before any data is fetched
- No indication that a portfolio exists is given to unauthenticated users

## API Key Protection

- Alpha Vantage API key stored in `process.env.ALPHA_VANTAGE_API_KEY`
- Never sent to the client
- `.env` file in `.gitignore`
- JWT secret in `process.env.JWT_SECRET`
- No API keys in client-side code or responses

## Input Validation

All user input is validated server-side using Zod schemas:

| Field | Validation |
|-------|-----------|
| Ticker | Required, 1-10 uppercase alpha chars, no special chars |
| Company name | Required, 1-200 chars, sanitized |
| Quantity | Required, positive number, max 10 decimal places |
| Average cost | Required, positive number, max 2 decimal places |
| Purchase date | Required, valid ISO date, not future |
| Notes | Optional, max 500 chars, sanitized |
| Username | Required, 1-50 chars, alphanumeric |
| Password | Required, 8+ chars |

### XSS Prevention
- All user-provided text (company names, notes, descriptions) is sanitized before storage
- React's JSX auto-escapes rendered values
- CSP headers restrict script sources

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST `/api/auth/login` | 5 requests | 1 minute |
| POST `/api/admin/market/refresh` | 1 request | 1 minute |
| All other admin routes | 100 requests | 1 minute |
| Public routes | 60 requests | 1 minute |

## Security Headers (Production)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

## Destructive Action Confirmations

| Action | Confirmation Required |
|--------|:--------------------:|
| Delete holding | Yes — modal with "Cannot be undone" |
| Archive holding | Yes — simple confirm |
| Unpublish page | Yes — modal with impact message |
| Refresh all market data | No (non-destructive) |
| Update settings | No (can be changed back) |

## Audit Trail

- All admin write operations are logged to `data/audit/{YYYY-MM}.md`
- Log format: timestamp, user, action, holding/field affected, old/new values
- Audit logs are append-only (no deletion)
- Provides basic accountability for data changes

## Threat Model (MVP Scope)

| Threat | Mitigation |
|--------|-----------|
| Brute force login | Rate limiting (5/min), bcrypt slow hash |
| XSS | CSP headers, React auto-escaping, input sanitization |
| CSRF | JWT in Authorization header (not cookie), SameSite not needed |
| Path traversal (file ops) | Whitelist allowed directories, validate ticker format |
| Information disclosure | Explicit response construction for public routes |
| API key exposure | Server-side only, env vars, gitignored .env |
| Data tampering | Auth middleware on all admin routes |
