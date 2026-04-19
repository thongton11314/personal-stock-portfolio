---
title: "Testing Conventions"
type: convention
created: 2026-04-14
updated: 2026-04-14
tags: [testing, qa, conventions, phase-5]
sources: [raw/prompt.md]
related: [coding-conventions, security-model, backend, frontend]
status: final
phase: 5
lead: Agent 6 (QA/Test Engineer)
---

# Testing Conventions

## Test Strategy

| Level | Tool | Scope | Coverage Target |
|-------|------|-------|:---:|
| Unit | Vitest | Services, calculations, utilities | > 80% |
| Integration | Vitest + Supertest | API routes end-to-end | Key paths |
| Component | Vitest + Testing Library | React components | Key components |
| Visual | Agent 7 (Playwright MCP) | Page rendering, flows | All pages |
| Manual | Checklist | Edge cases, UX review | Release gate |

## Test File Organization

- Colocated: `calculationService.test.ts` next to `calculationService.ts`
- Test data fixtures in `__fixtures__/` directories
- Shared test utilities in `test/helpers/`

## Critical Test Scenarios

### Security Tests
1. Admin routes return 401 without JWT
2. Admin routes return 401 with expired JWT
3. Admin routes return 401 with invalid JWT
4. Login rate limiting enforced after 5 attempts
5. Public routes never include quantity, averageCost, purchaseDate
6. Public routes return 404 when portfolio is unpublished
7. Hidden holdings are absent from public API responses
8. Archived holdings are absent from public API responses

### Return Calculation Tests
1. Single holding: marketValue = quantity * price
2. Single holding: gainLoss = marketValue - totalCost
3. Multiple holdings: totalValue = SUM(marketValues)
4. Allocation weights sum to 100%
5. Cumulative return matches manual calculation (+/- 0.01%)
6. Benchmark return matches manual SPY calculation
7. Relative performance = portfolio - benchmark
8. Holdings with different purchase dates: correct portfolio time series

### API Failure Tests
1. Alpha Vantage returns error → cache fallback
2. Alpha Vantage rate limited → 429 with cached data
3. Invalid ticker → 404
4. Malformed AV response → graceful error
5. Network timeout → cached data with stale warning
6. Empty cache + API failure → clear error message

### Data Validation Tests
1. Create holding with missing required fields → 400
2. Create duplicate holding → 409
3. Create holding with future purchase date → 400
4. Create holding with negative quantity → 400
5. Create holding with invalid ticker format → 400
6. Update non-existent holding → 404
7. Delete non-existent holding → 404

### Edge Case Tests
1. Zero holdings → empty state responses
2. All holdings archived → empty portfolio
3. Single holding → 100% allocation
4. Purchase on weekend → next trading day used
5. Very small allocation → displayed as "< 0.1%"
6. Price = 0 → excluded from calculations with warning

## Regression Priorities (Risk-Based)

| Priority | Area | Rationale |
|----------|------|-----------|
| P0 | Security (quantity not in public) | Data privacy — highest impact |
| P0 | Auth enforcement | Security breach if broken |
| P0 | Return calculations | Financial accuracy — trust |
| P1 | CRUD operations | Core functionality |
| P1 | Cache/rate limiting | Operational reliability |
| P2 | UI rendering | User experience |
| P2 | Responsive layout | Desktop-first, mobile nice-to-have |
| P3 | Edge cases | Important but lower probability |

## Release Readiness Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Backend test coverage > 80%
- [ ] ESLint: zero errors, zero warnings
- [ ] No `any` types in production code
- [ ] Security tests all pass
- [ ] Public API never exposes quantity
- [ ] Unpublished page returns 404
- [ ] Hidden/archived holdings absent from public API
- [ ] Return calculations verified against manual spreadsheet
- [ ] Allocation weights sum to 100%
- [ ] Agent 7 visual test report: all pages pass
- [ ] Lighthouse accessibility >= 90 (admin and public)
- [ ] No console errors on any page
- [ ] Responsive layout verified at 1280px and 375px
- [ ] Keyboard navigation works on all interactive elements
- [ ] LCP < 2.5s desktop, < 4s mobile
- [ ] API p95 < 500ms cached, < 3s live
- [ ] Zero critical or high-severity bugs
