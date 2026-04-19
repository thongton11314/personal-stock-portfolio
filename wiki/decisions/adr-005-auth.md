---
title: "ADR-005: Authentication and Authorization"
type: decision
created: 2026-04-14
updated: 2026-04-14
tags: [adr, auth, security, phase-3]
sources: [raw/prompt.md]
related: [system-architecture, api-routes, security-model]
status: active
phase: 3
lead: Agent 3 (Solution Architect)
---

# ADR-005: Authentication and Authorization

## Context

The admin portal needs authentication. The MVP has a single admin user. The solution must protect admin routes while keeping public routes open.

## Options Considered

### Option A: JWT + bcrypt (Selected)
- Username/password stored in `data/settings.json` (password hashed with bcrypt).
- Login returns a JWT token stored in localStorage.
- Admin API routes validate the JWT on every request.
- **Pro**: Stateless, simple, no session store needed, well-understood.
- **Con**: JWT in localStorage is vulnerable to XSS (mitigated by CSP headers).

### Option B: Session-based auth with cookies
- Express session middleware with cookie.
- **Pro**: HttpOnly cookies are safer against XSS.
- **Con**: Requires session store (file-based or memory), more server state.

### Option C: OAuth / third-party auth
- Auth0, Firebase Auth, or GitHub OAuth.
- **Pro**: Industry-standard, managed security.
- **Con**: External dependency, over-engineering for single-user MVP.

## Decision

**Option A** — JWT + bcrypt.

Implementation:
1. Password hashed with bcrypt (cost factor 10) and stored in `data/settings.json`
2. Login endpoint verifies password, returns signed JWT (24h expiry)
3. JWT contains: `{ username, iat, exp }`
4. Auth middleware on all `/api/admin/*` routes validates JWT
5. Frontend stores token in localStorage, sends as `Authorization: Bearer {token}`
6. Token refresh: user re-authenticates after expiry

Security hardening:
- HTTPS in production (enforced by hosting)
- Content Security Policy headers to mitigate XSS
- Rate limiting on login endpoint (5 attempts per minute)
- JWT secret from environment variable (never hardcoded)

## Consequences

- **Positive**: Simplest auth model for single-user MVP. No external dependencies.
- **Positive**: Stateless — no session store management.
- **Risk**: JWT in localStorage vulnerable to XSS. Mitigated by CSP headers and input sanitization.
- **Risk**: No password reset mechanism for MVP. Mitigated: admin can reset by editing settings.json directly.
- **Follow-up**: If multi-user is needed in v2, migrate to session-based auth with proper cookie handling.
