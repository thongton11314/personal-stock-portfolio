---
title: "ADR-003: Tech Stack Selection"
type: decision
created: 2026-04-14
updated: 2026-04-14
tags: [adr, tech-stack, phase-3]
sources: [raw/prompt.md]
related: [system-architecture, frontend, backend]
status: active
phase: 3
lead: Agent 3 (Solution Architect)
---

# ADR-003: Tech Stack Selection

## Context

The MVP requires a tech stack that supports a single-developer workflow, GitHub-based CI/CD, file-based data storage, and Alpha Vantage integration. The stack must be simple, maintainable, and production-ready.

## Evaluation Matrix

Criteria scored 1-5 (5 = best).

### Frontend

| Criterion | React + Vite | Vue + Vite |
|-----------|:---:|:---:|
| MVP speed | 5 | 5 |
| Simplicity | 4 | 5 |
| GitHub ecosystem | 5 | 4 |
| Maintainability | 5 | 4 |
| Deployment ease | 5 | 5 |
| Alpha Vantage fit | 5 | 5 |
| Security posture | 4 | 4 |
| Scalability path | 5 | 4 |
| Team familiarity | 5 | 3 |
| Cost | 5 | 5 |
| **Total** | **48** | **44** |

### Backend

| Criterion | Node.js / Express | Python / FastAPI |
|-----------|:---:|:---:|
| MVP speed | 5 | 4 |
| Simplicity | 5 | 4 |
| GitHub ecosystem | 5 | 4 |
| Maintainability | 4 | 5 |
| Deployment ease | 5 | 4 |
| Alpha Vantage fit | 5 | 5 |
| Security posture | 4 | 4 |
| Scalability path | 4 | 5 |
| Team familiarity | 5 | 3 |
| Cost | 5 | 5 |
| **Total** | **47** | **43** |

### Charting Library

| Criterion | Chart.js | Recharts |
|-----------|:---:|:---:|
| Simplicity | 5 | 4 |
| React integration | 3 | 5 |
| Bundle size | 4 | 4 |
| Financial chart support | 4 | 4 |
| Accessibility | 3 | 4 |
| **Total** | **19** | **21** |

## Decision

### Selected Stack

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Frontend Framework | React | 18.x | Largest ecosystem, strong TypeScript support, team familiarity |
| Build Tool | Vite | 5.x | Fast dev server, optimized builds, excellent DX |
| Routing | React Router | 6.x | Standard React routing, supports protected routes |
| Charting | Recharts | 2.x | React-native, composable, good accessibility |
| Styling | CSS Modules + Variables | - | Custom design system per ADR-002, no framework overhead |
| Backend Runtime | Node.js | 20.x LTS | Single language (JS/TS), strong npm ecosystem |
| Backend Framework | Express | 4.x | Minimal, well-understood, massive middleware ecosystem |
| Language | TypeScript | 5.x | Type safety across frontend and backend, shared types |
| API Client | Axios | 1.x | HTTP client for Alpha Vantage, interceptors for rate limiting |
| Auth | JWT + bcrypt | - | Stateless auth, simple for single-user MVP |
| Testing | Vitest + Testing Library | - | Fast, Vite-native, good React testing support |
| Linting | ESLint + Prettier | - | Standard code quality tooling |
| Package Manager | npm | - | Default, no additional tooling needed |

### Single-Language Advantage

TypeScript across frontend and backend enables:
- Shared type definitions for API contracts
- Single test runner (Vitest)
- Single build pipeline
- Reduced context switching

## Consequences

- **Positive**: Full-stack TypeScript — one language, shared types, single toolchain.
- **Positive**: React + Express is the most common stack; maximum community support.
- **Positive**: Vite provides excellent DX with fast HMR and optimized builds.
- **Positive**: Recharts integrates natively with React for chart components.
- **Risk**: Express 4.x is mature but not the newest. Mitigated: stable, well-supported, upgrade path to Express 5 exists.
- **Follow-up**: Agent 5 confirms Axios + caching pattern for Alpha Vantage integration.
