---
title: "ADR-004: Data Storage Format"
type: decision
created: 2026-04-14
updated: 2026-04-14
tags: [adr, data, storage, json, phase-3]
sources: [raw/prompt.md]
related: [data-storage-schema, system-architecture]
status: active
phase: 3
lead: Agent 3 (Solution Architect)
---

# ADR-004: Data Storage Format

## Context

The project requires file-based persistence (no database server). The choice is between markdown with YAML frontmatter and JSON files.

## Options Considered

### Option A: Markdown with YAML Frontmatter
- Holdings and settings stored as `.md` files with YAML frontmatter for structured data.
- **Pro**: Human-readable in GitHub, matches the wiki pattern.
- **Con**: Parsing YAML frontmatter adds complexity. Write operations require rebuilding the file. No native support in Node.js — needs a parser library (gray-matter). Mixing structured data with markdown body is awkward for pure data records.

### Option B: JSON Files (Selected)
- Holdings and settings stored as `.json` files.
- **Pro**: Native `JSON.parse` / `JSON.stringify` in Node.js. No additional parser needed. Clean read/write operations. Type-safe with TypeScript interfaces. Easy to validate with schemas.
- **Con**: Less human-readable for large files (mitigated: each holding is a small, separate file).

## Decision

**Option B** — JSON files.

Each holding is a separate JSON file named by ticker (`AAPL.json`). Settings are a single `settings.json`. Cache and benchmark data are JSON. Audit logs are append-only markdown (human-readable is more important for logs).

This gives:
- Zero-dependency parsing (native JSON)
- One file per holding (clean CRUD operations, no merge conflicts)
- TypeScript interfaces for type safety
- Easy to validate and test
- Human-readable enough for small files

Audit logs use markdown because they are append-only, human-read, and benefit from the readability of markdown formatting.

## Repository Visibility

The GitHub repository must be **PRIVATE** because `data/holdings/` contains sensitive financial data (quantities, cost basis). If a public repository is needed in the future, `data/` must be added to `.gitignore` with an alternative persistence strategy.

## Consequences

- **Positive**: Simplest possible data layer — no ORM, no SQL, no parser libraries.
- **Positive**: Each holding is an independent file — no lock contention, easy CRUD.
- **Positive**: Git provides version history and rollback.
- **Risk**: File-based storage may become slow at ~100+ holdings. Mitigated: listings are cached in memory after first read; individual reads are O(1).
- **Risk**: No ACID transactions. Mitigated: single-user MVP; write conflicts are extremely unlikely.
