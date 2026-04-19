---
title: "ADR-001: MVP Scope Boundaries"
type: decision
created: 2026-04-14
updated: 2026-04-14
tags: [adr, mvp, scope, phase-1]
sources: [raw/prompt.md]
related: [mvp-scope, user-roles]
status: active
phase: 1
lead: Agent 1 (Product Strategist)
---

# ADR-001: MVP Scope Boundaries

## Context

The portfolio management platform must be scoped to a deliverable MVP that a single developer can build, test, and deploy. The prompt defines a broad feature set across admin management, public display, market data integration, and benchmark comparison. Clear boundaries are needed to prevent scope creep while ensuring the MVP delivers meaningful value.

## Options Considered

### Option A: Full Feature Set
Build everything described in the prompt, including dividend tracking, multi-portfolio support, and advanced charting.
- **Pro**: Complete product from day one.
- **Con**: Too large for a single-developer MVP. High risk of delayed delivery.

### Option B: Core Portfolio Management + Public Page (Selected)
Build the admin portal with holdings CRUD, Alpha Vantage integration, benchmark comparison, and a publishable public page. Defer advanced features (dividends, multi-portfolio, real-time data, export).
- **Pro**: Delivers complete core value. Manageable scope. Clean foundation for future extension.
- **Con**: Some features deferred to v2.

### Option C: Admin-Only MVP
Build only the admin portal without the public page.
- **Pro**: Smallest scope.
- **Con**: Misses a core value proposition (public portfolio display).

## Decision

**Option B** — Core Portfolio Management + Public Page.

The MVP includes:
- Full admin portal (dashboard, holdings CRUD, settings, preview, publish/unpublish)
- Public portfolio page (overview, holdings by weight, performance chart, methodology)
- Alpha Vantage integration with caching and rate-limit handling
- S&P 500 benchmark comparison via SPY proxy
- File-based data storage (markdown/JSON in `data/` directory)
- Single-user authentication
- Responsive layout (desktop-first)
- Accessibility compliance

The MVP excludes:
- Multi-user/multi-portfolio support
- Dividend and tax lot tracking
- Real-time price streaming
- Export (CSV/PDF)
- Advanced charting
- Dark mode, i18n, mobile native

## Consequences

- **Positive**: Clean, focused MVP that can be built, tested, and deployed in a reasonable timeframe.
- **Positive**: File-based storage keeps the architecture simple and GitHub-native.
- **Positive**: Clear extension points for v2 features.
- **Risk**: File-based storage may become a bottleneck if holdings exceed ~100. Mitigated by ADR-004 evaluation.
- **Risk**: Alpha Vantage free tier limits (25 req/day) may constrain usability. Mitigated by aggressive caching.
- **Follow-up**: Agent 3 evaluates storage format in ADR-004. Agent 5 defines caching strategy.
