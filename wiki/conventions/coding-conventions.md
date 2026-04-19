---
title: "Coding Conventions"
type: convention
created: 2026-04-14
updated: 2026-04-14
tags: [coding, conventions, typescript, phase-3]
sources: [raw/prompt.md]
related: [frontend, backend, adr-003-tech-stack]
status: final
phase: 3
lead: Agent 3 (Solution Architect)
---

# Coding Conventions

## Language

- TypeScript throughout (frontend and backend)
- Strict mode enabled in both tsconfig files
- No `any` type except in truly generic utility code
- Prefer `interface` over `type` for object shapes
- Use `enum` sparingly; prefer string union types

## Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Files (components) | PascalCase | `HoldingForm.tsx` |
| Files (utilities) | camelCase | `dateUtils.ts` |
| Files (styles) | camelCase | `holdingForm.module.css` |
| Components | PascalCase | `MetricCard` |
| Functions | camelCase | `calculateGainLoss` |
| Variables | camelCase | `totalValue` |
| Constants | SCREAMING_SNAKE | `MAX_CACHE_AGE_MS` |
| Interfaces | PascalCase, no I-prefix | `Holding`, `Settings` |
| Type aliases | PascalCase | `HoldingStatus` |
| CSS variables | kebab-case | `--color-primary` |
| API routes | kebab-case | `/api/admin/holdings` |
| Data files | UPPERCASE ticker | `AAPL.json` |

## Project Structure

- `client/` — frontend React application
- `server/` — backend Express application
- `shared/` — shared TypeScript types (imported by both)
- `data/` — persistent data files (JSON + markdown)
- `scripts/` — development and deployment scripts

## Imports

- Group imports: external libraries, then internal modules, then types
- Use path aliases where configured (e.g., `@/components/`)
- Prefer named exports over default exports

## Error Handling

- Backend: all route handlers wrapped in try/catch, errors passed to `next()`
- Frontend: API errors caught in hooks, exposed as error state
- User-facing error messages: clear, actionable, no stack traces
- Log full error details server-side only

## API Patterns

- RESTful routes following [[rest]] conventions
- JSON request/response bodies
- Consistent error format: `{ "error": "message", "details": [...] }`
- Pagination: `?page=1&limit=20` with response metadata
- Sorting: `?sort=field&order=asc|desc`

## Testing

- Test files colocated: `*.test.ts` next to source files
- Unit tests for services, calculations, utilities
- Integration tests for API routes
- Frontend: React Testing Library for component tests
- Minimum 80% coverage on backend business logic

## Git

- Branch naming: `feature/description`, `fix/description`
- Commit messages: imperative mood, concise ("Add holdings CRUD routes")
- No direct pushes to main — use PRs (even for single developer, for CI)
