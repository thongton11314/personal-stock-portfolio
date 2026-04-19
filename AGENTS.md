# AI Development Framework — Schema

This file defines conventions, structure, and workflows for the AI development agent.
Read this file at the start of every session.

---

## Purpose

This framework provides **persistent context** for AI-assisted development. It combines:
- **Knowledge management** — ingest documents, research, and references into a structured wiki.
- **Codebase awareness** — track architecture decisions, module contracts, conventions, and change history so the AI never loses context as the project grows.

**Before** any code or document operation, the AI reads the wiki to stay consistent.
**After** any operation, the AI updates the wiki to preserve context for future sessions.

---

## Terminology

- **Workflows** (1–9) — operational procedures for managing knowledge and code (ingest, query, lint, etc.). Defined in this file.
- **Phases** (1–8) — sequential application delivery steps in the multi-agent pipeline. Defined in `framework-template.md`.
- **Agents** (0–7) — eight specialized AI entities that execute phases. Defined in `framework-template.md`.

---

## Directory Structure

```
raw/                  # Immutable source documents (articles, papers, specs, data)
  assets/             # Downloaded images and attachments
wiki/                 # AI-maintained pages — never edit manually
  sources/            # One summary page per ingested document
  entities/           # People, orgs, products, tools, services
  concepts/           # Ideas, frameworks, patterns, theories
  analyses/           # Comparisons, syntheses, research outputs
  architecture/       # System design, component maps, data flows
  decisions/          # Architecture Decision Records (ADRs)
  conventions/        # Coding standards, naming rules, project patterns
  modules/            # One page per module/component/service
  index.md            # Master catalog of all wiki pages
  log.md              # Chronological record of all operations
  overview.md         # High-level synthesis (knowledge + system state)
AGENTS.md             # This file — schema and conventions
framework-template.md # Multi-agent orchestration template for new projects
```

---

## Page Conventions

### Frontmatter

Every wiki page must start with YAML frontmatter:

```yaml
---
title: "Page Title"
type: source | entity | concept | analysis | architecture | decision | convention | module | overview
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]
sources: []           # raw documents this page draws from
related: []           # related wiki pages (wikilink targets)
status: active | draft | deprecated | superseded
---
```

### Content Format

- Use standard markdown with `[[wikilinks]]` for cross-references between wiki pages.
- Use `> [!note]` callouts for editorial commentary or open questions.
- Use `> [!contradiction]` callouts when new data conflicts with existing claims.
- Use `> [!breaking]` callouts when a change breaks existing contracts or conventions.
- Headings: `##` for major sections, `###` for subsections. Reserve `#` for the page title only.
- Keep paragraphs concise — prefer bullet points for factual claims.
- Cite sources inline: `(Source: [[source-page-name]])`.

### Naming

- Filenames: lowercase, hyphenated. E.g. `machine-learning.md`, `user-auth-service.md`.
- Source pages: named after the source document.
- Entity pages: named after the entity.
- Module pages: named after the module/component.
- Decision pages: numbered. E.g. `adr-001-use-typescript.md`.
- Convention pages: named by topic. E.g. `error-handling.md`, `naming-conventions.md`.

---

## Workflows

### Knowledge Workflows

#### 1. Ingest a Source

When the user adds a new file to `raw/` and asks to ingest it:

1. **Read** the source document in full.
2. **Discuss** key takeaways with the user (3-5 bullet points). Wait for confirmation before proceeding.
3. **Create** a source summary page in `wiki/sources/`.
   - Include: title, author, date, key claims, notable quotes, relevance to existing wiki.
4. **Update** existing pages:
   - Add/revise relevant entity pages in `wiki/entities/`.
   - Add/revise relevant concept pages in `wiki/concepts/`.
   - Flag contradictions with `> [!contradiction]` callouts on affected pages.
   - Add `[[wikilinks]]` cross-references on all touched pages.
5. **Update** `wiki/index.md` — add entries for any new pages, update summaries for modified pages.
6. **Update** `wiki/overview.md` if the source materially changes the high-level synthesis.
7. **Append** to `wiki/log.md`.

#### 2. Query the Wiki

When the user asks a question:

1. **Read** `wiki/index.md` to identify relevant pages.
2. **Read** the relevant pages.
3. **Synthesize** an answer with inline citations: `(Source: [[page-name]])`.
4. **Offer** to file the answer as a new analysis page in `wiki/analyses/` if it's substantive.

#### 3. Create Analysis

When the user asks for a comparison, synthesis, or deep-dive:

1. **Gather** relevant wiki pages.
2. **Generate** the analysis as a new page in `wiki/analyses/`.
3. **Cross-reference** the analysis from relevant entity/concept pages.
4. **Update** `wiki/index.md`.
5. **Append** to `wiki/log.md`.

### Code Workflows

#### 4. Before Any Code Change

Before writing, modifying, or deleting code:

1. **Read** `wiki/index.md` to locate relevant module, architecture, decision, and convention pages.
2. **Read** the relevant pages to understand:
   - Existing patterns and conventions (`wiki/conventions/`).
   - Module contracts and dependencies (`wiki/modules/`).
   - Architecture constraints and data flows (`wiki/architecture/`).
   - Past decisions and their rationale (`wiki/decisions/`).
3. **Follow** established patterns. If the change conflicts with existing conventions, flag it to the user before proceeding.

#### 5. After Any Code Change

After completing a code create/update/delete operation:

1. **Update module pages** (`wiki/modules/`) — reflect new exports, changed interfaces, added/removed dependencies.
2. **Update architecture pages** (`wiki/architecture/`) — if the change affects system design, data flows, or component relationships.
3. **Update convention pages** (`wiki/conventions/`) — if a new pattern was introduced or an existing one was modified.
4. **Create a decision record** (`wiki/decisions/`) — if the change involved a non-trivial architectural or design choice.
5. **Flag contradictions** — if the change conflicts with documented patterns, add `> [!breaking]` callouts on affected pages.
6. **Update** `wiki/index.md` for any new or modified pages.
7. **Append** to `wiki/log.md`.

##### Sync Verification Checklist

After steps 1–7, perform a **bidirectional verification** before marking the code change complete.

**Pass 1 — Code → Wiki** (every code artifact has documentation):
- List every file created, modified, or deleted in this change.
- For each new file, confirm it appears in the relevant `wiki/modules/` directory listing.
- For each new route/endpoint, confirm it appears in the relevant architecture page.
- For each new page, component, or nav item, confirm it appears in the relevant module and information architecture pages.

**Pass 2 — Wiki → Code** (every wiki claim is true):
- Read the directory listings in every wiki module page affected by this change.
- Verify every listed file actually exists in the codebase. If not: remove it from the listing or mark it as `(empty — reason)`.
- Verify route/endpoint tables match the routes actually registered in code.
- Verify sitemap and navigation sections match the actual routing configuration.

**Output**: Show a summary table to the user:

```
| Change | Type | Wiki Page Updated | Pass 1 | Pass 2 |
|--------|------|-------------------|--------|--------|
| (file) | create/modify/delete | (page) | ✅/❌ | ✅/❌ |
```

Both passes must show ✅ for all rows before the code change is considered complete.

**Deviation protocol**: When implementation differs from a spec-phase wiki page:
1. Update the wiki page to reflect the actual implementation.
2. Add `> [!note] Deviation from Phase N spec: {description}` explaining why.
3. Never leave aspirational listings in directory trees — wiki must describe what exists.

#### 6. Register a Module

When a new module, component, or service is created:

1. **Create** a module page in `wiki/modules/` with:
   - Purpose and responsibility.
   - Public interface (exports, APIs, events).
   - Dependencies (what it imports/consumes).
   - Dependents (what depends on it) — update those module pages too.
   - Key design decisions and constraints.
2. **Update** `wiki/architecture/` pages to show the new component in the system.
3. **Cross-reference** from relevant concept and entity pages.
4. **Update** `wiki/index.md`.
5. **Append** to `wiki/log.md`.

#### 7. Record a Decision

When a design or architecture decision is made:

1. **Create** an ADR page in `wiki/decisions/` with:
   - Context — what problem or need prompted the decision.
   - Options considered — alternatives that were evaluated.
   - Decision — what was chosen and why.
   - Consequences — trade-offs, risks, follow-up actions.
   - Status — `active`, `superseded`, or `deprecated`.
2. **Cross-reference** from affected module, architecture, and convention pages.
3. **Update** `wiki/index.md`.
4. **Append** to `wiki/log.md`.

### Orchestration Workflows

#### 8. Use the Orchestration Template

When the user wants to build a new application using the multi-agent pipeline:

1. **Copy** `framework-template.md` and rename it for the project (e.g. `my-app-spec.md`).
2. **Replace** all `{PLACEHOLDER}` tokens with project-specific values.
3. **Fill in** `[CUSTOMIZE]` sections with domain-specific content.
4. **Leave** `[FRAMEWORK]` sections as-is — they work for any project.
5. **Place** the completed spec in `raw/` as an immutable source (e.g. `raw/prompt.md`).
6. **Start** Phase 1 — the Orchestrator agent reads the spec and activates the Product Strategist.

The template defines 8 agents and 8 phases. See `wiki/concepts/multi-agent-orchestration.md` and `wiki/concepts/phased-development-pipeline.md` for details.

### Maintenance Workflows

#### 9. Lint / Health Check

When the user asks to lint or review the wiki:

1. **Scan** all wiki pages for:
   - Orphan pages (no inbound `[[wikilinks]]`).
   - Broken `[[wikilinks]]` (target page doesn't exist).
   - Stale claims superseded by newer sources or code changes.
   - Unresolved `> [!contradiction]` or `> [!breaking]` callouts.
   - Modules in code that lack wiki pages.
   - Convention pages that don't match actual code patterns.
   - Missing or incomplete frontmatter fields.
   - Deprecated decisions still referenced as active.
2. **Report** findings as a checklist.
3. **Fix** issues with user approval.
4. **Append** to `wiki/log.md`.

---

## Log Format

Each entry in `wiki/log.md` follows this format:

```markdown
## [YYYY-MM-DD] operation | Title
- **Operation**: ingest | query | lint | analysis | update
- **Pages touched**: [[page1]], [[page2]], ...
- **Summary**: One-line description of what changed.
```

---

## Index Format

Each entry in `wiki/index.md` follows this format:

```markdown
### Category Name

| Page | Summary | Sources | Updated |
|------|---------|---------|---------|
| [[page-name]] | One-line summary | 2 | 2026-04-13 |
```

---

## Guiding Principles

1. **The wiki is the product.** Chat is ephemeral; the wiki is permanent. Anything valuable should be filed.
2. **Compound, don't repeat.** When new data arrives, update existing pages — don't create duplicates.
3. **Flag conflicts explicitly.** Contradictions are valuable information. Never silently overwrite.
4. **Cross-reference aggressively.** The value of the wiki grows with its connections.
5. **Human curates, LLM maintains.** The user decides what to ingest and what questions to ask. The LLM does all the filing, linking, and bookkeeping.
