PORTFOLIO MANAGEMENT PLATFORM — AGENTIC ORCHESTRATION SPEC

This document defines a multi-agent orchestration system for designing, specifying,
and building a portfolio management web application. Eight agents collaborate through
a phased pipeline with explicit contracts, handoffs, review loops, and quality gates.

================================================================================
SECTION 1 — FRAMEWORK DEPENDENCY
================================================================================

This project uses the AI Development Framework from:
https://github.com/thongton11314/agent-coding-template

The framework provides persistent context across sessions via a structured wiki.
Before starting any work, ensure the framework is installed in this project.
If it is not installed, run the setup script:

  PowerShell:  irm https://raw.githubusercontent.com/thongton11314/agent-coding-template/main/scripts/setup.ps1 | iex

Key framework files:
- AGENTS.md — schema, conventions, and workflows (read at every session start)
- wiki/index.md — master catalog of all wiki pages
- wiki/log.md — chronological operation record
- wiki/overview.md — high-level project synthesis

Framework contract:
- Before any code or design work, read relevant wiki pages for prior decisions
- After completing any phase, persist outputs to the wiki
- Architecture goes to wiki/architecture/
- Module specs go to wiki/modules/
- Design decisions go to wiki/decisions/ as ADRs
- Coding conventions go to wiki/conventions/
- Domain concepts go to wiki/concepts/
- Update wiki/index.md and wiki/log.md after every operation

The original prompt specification lives in raw/prompt.md as an immutable source.

================================================================================
SECTION 2 — SESSION PROTOCOL
================================================================================

At the start of every session:
1. Read AGENTS.md for framework rules
2. Read wiki/index.md to see what exists
3. Read wiki/overview.md for current project state
4. Identify which phase to work on (check wiki/log.md for last completed phase)
5. Read any wiki pages relevant to the current phase

At the end of every session or phase:
1. Write all deliverables to the appropriate wiki directories
2. Update wiki/index.md with new and modified pages
3. Append to wiki/log.md with operation summary
4. Update wiki/overview.md if the project state changed materially
5. State clearly which phase was completed and which phase is next

If a session is interrupted mid-phase:
1. Write a checkpoint note to wiki/log.md listing completed and remaining items
2. The next session resumes from that checkpoint

================================================================================
SECTION 3 — PROJECT GOAL
================================================================================

Build a professional portfolio management platform with:

1. A private Admin Portal for portfolio management
2. A public Portfolio Page for external viewers
3. Performance comparison against the S&P 500 benchmark
4. Market data powered by Alpha Vantage
5. A simple, maintainable, production-ready MVP architecture
6. Source code hosted on GitHub

Hosting and deployment constraints:
- Source code repository is on GitHub
- CI/CD should use GitHub Actions
- The application must be deployable from the GitHub repository
- The tech stack must be compatible with GitHub-based workflows
  (e.g., npm/pip/dotnet-based build, containerizable if needed)
- Prefer tech stacks with strong GitHub ecosystem support
  (community, templates, Actions marketplace)

Data storage constraint:
- Use markdown files as the persistent data store, following the same
  structured-file pattern used by the project wiki
- No traditional database server (no PostgreSQL, MySQL, MongoDB, etc.)
- No SQLite unless the markdown approach proves insufficient during
  Phase 3 evaluation, in which case Agent 3 must record the reasoning
  in ADR-004
- Holdings, portfolio settings, cached market data, and audit logs are
  stored as structured markdown or JSON files in a data/ directory
- The data/ directory follows a predictable layout:
    data/holdings/          — one file per holding (e.g., AAPL.md or AAPL.json)
    data/settings.md        — portfolio settings and configuration
    data/cache/             — cached Alpha Vantage responses (JSON)
    data/benchmark/         — cached benchmark data (JSON)
    data/audit/             — change log entries (append-only markdown)
- File format options: markdown with YAML frontmatter, or JSON files
  (Agent 3 decides in ADR-004 which format best fits read/write patterns)
- Data operations use file system read/write — no ORM, no SQL
- Git itself provides version history and rollback capability
- This approach keeps the entire application state in the repository,
  making it fully portable, inspectable, and GitHub-native

Repository data exposure:
- The GitHub repository must be PRIVATE to protect sensitive portfolio data
  (holdings quantities, cost basis, audit logs)
- If a public repository is required in the future, the data/ directory
  must be added to .gitignore with an alternative persistence strategy
  documented in ADR-004
- Agent 3 must address this in the security model (Phase 5 cross-reference)

Cache management:
- The data/cache/ and data/benchmark/ directories must be listed in
  .gitignore to prevent repository bloat from accumulated API responses
- Cache files are ephemeral and regenerated on demand via Alpha Vantage
- Agent 3 must define a cache eviction policy (e.g., max age, max file
  count) in ADR-004 to prevent unbounded local disk growth

================================================================================
SECTION 4 — GENERAL PRINCIPLES
================================================================================

- Keep the UX simple and professional
- Do not use emoji
- Do not use decorative or playful icons
- Prefer clarity, structure, and trustworthiness
- Avoid over-engineering the MVP
- Make recommendations practical and implementable
- Explain tradeoffs clearly
- Optimize for maintainability and scalability from a clean foundation
- Treat this as a financial-style product where accuracy and trust are critical

================================================================================
SECTION 5 — PRODUCT CONTEXT
================================================================================

The application supports two core experiences:

A. ADMIN PORTAL
The admin portal is private and used to manage portfolio information.

Admin capabilities:
- secure login
- dashboard summary
- add, edit, archive, and delete holdings
- add more ticker symbols
- configure holding details
- update public visibility per holding
- reorder holdings for display
- manage portfolio settings
- refresh market data from Alpha Vantage
- preview public page
- publish and unpublish public page
- compare portfolio performance against the S&P 500 benchmark

Holding fields:
- ticker
- company name
- asset type
- quantity (admin-only, never shown on public page)
- average cost
- purchase date
- sector
- notes
- public visibility
- display order
- status such as active or archived

B. PUBLIC PORTFOLIO PAGE
The public page is read-only and intended for visitors.
The public page must show portfolio weight (allocation percentage) per holding
but must never expose quantity (number of shares).

Public capabilities:
- view portfolio summary
- view public holdings only
- review allocation and composition via weight percentages
- review performance over time
- compare portfolio returns with S&P 500 benchmark
- read methodology and disclaimer
- view last updated date

================================================================================
SECTION 6 — BENCHMARK REQUIREMENT
================================================================================

The benchmark is the S&P 500.
Use a practical implementation approach compatible with Alpha Vantage.
If needed, recommend using SPY as a benchmark proxy and explain why.
The benchmark comparison must be shown over the same time range as the portfolio.

Portfolio time range definition:
- A portfolio with holdings purchased on different dates has no single start
  date. The default benchmark comparison start date should be the earliest
  purchase date among all active holdings, unless the user selects a custom
  date range.
- Agent 5 must define the exact alignment logic (earliest purchase date vs
  user-selected range) and document it in wiki/concepts/benchmark-methodology.md.

================================================================================
SECTION 7 — ALPHA VANTAGE REQUIREMENT
================================================================================

Use Alpha Vantage as the market data provider.
The system must support:
- symbol validation
- current market price retrieval
- historical price retrieval
- rate-limit-aware integration
- server-side API key protection
- caching strategy
- handling stale, missing, or invalid data
- visible "last updated" timestamps

================================================================================
SECTION 8 — AGENT DEFINITIONS
================================================================================

Eight agents operate in this system. Each has a defined scope, trigger conditions,
input/output contracts, available tools, and a quality gate.

--------------------------------------------------------------------------------
AGENT 0: ORCHESTRATOR
--------------------------------------------------------------------------------
  Role:        Coordinates all agents, routes work, enforces phase gates,
               resolves conflicts.
  Trigger:     Session start, phase transition, conflict between agents,
               escalation request.
  Input:       wiki/log.md (last completed phase), wiki/overview.md (project state),
               all phase deliverables from upstream agents.
  Output:      Phase activation signal, agent assignments, conflict resolution
               decisions, phase completion confirmation.
  Tools:       File system (wiki read/write), session protocol execution.
  Quality gate: All required deliverables for a phase exist and pass review
                before the next phase is activated.
  Responsibilities:
    - Determine which phase to execute based on wiki/log.md
    - Assign lead agent and contributing agents for each phase
    - Route phase deliverables to reviewers
    - Collect review feedback and request revisions if needed
    - Resolve conflicts between agent recommendations (see CONFLICT RESOLUTION)
    - Enforce that no phase starts until the prior phase gate passes
    - Write phase completion records to wiki/log.md

--------------------------------------------------------------------------------
AGENT 1: PRODUCT STRATEGIST
--------------------------------------------------------------------------------
  Role:        Define scope, priorities, tradeoffs, roadmap, and risk.
  Trigger:     Assigned by Orchestrator for Phases 1, 6.
  Input:       Project goal, general principles, product context (Sections 3-5).
  Output:      Executive summary, product vision, user roles, MVP scope definition,
               feature priority matrix, risk register, delivery roadmap.
  Artifacts:   wiki/analyses/mvp-scope.md, wiki/concepts/user-roles.md,
               wiki/analyses/risk-tradeoff-analysis.md,
               wiki/analyses/implementation-roadmap.md.
  Tools:       File system (wiki write), semantic search (prior ADRs).
  Quality gate: MVP scope is concrete (not generic), every feature is classified as
                MVP or future, assumptions are explicit, risks have mitigations.
  Responsibilities:
    - Define target users and their needs
    - Set MVP boundaries with clear in/out lists
    - Prioritize features using MoSCoW or similar
    - Identify business logic assumptions
    - Define roadmap phases with entry/exit criteria
    - Assess key product risks and tradeoffs
    - Record ADR-001: MVP scope boundaries

--------------------------------------------------------------------------------
AGENT 2: UX/UI DESIGNER
--------------------------------------------------------------------------------
  Role:        Design layouts, flows, states, accessibility, and visual direction.
  Trigger:     Assigned by Orchestrator for Phase 2.
               Also reviews Phase 3 frontend spec.
  Input:       MVP scope (from Agent 1), product context, required features
               (Section 10).
  Output:      Information architecture, admin user flows, public user flows,
               UX design principles, page-by-page UX spec, wireframe-level layouts,
               design system guidance.
  Artifacts:   wiki/architecture/information-architecture.md,
               wiki/conventions/design-system.md,
               wiki/modules/admin-portal.md (UX spec),
               wiki/modules/public-page.md (UX spec).
  Tools:       File system (wiki write).
  Quality gate: Every page has defined layout, empty state, loading state, error
                state. Accessibility patterns are specified. Flows cover happy path
                and error path. All designs stay within MVP scope (cross-checked
                against Agent 1 output).
  Responsibilities:
    - Create sitemap and information architecture
    - Design admin flows (dashboard, holdings CRUD, settings, preview, publish)
    - Design public user flows (view portfolio, browse holdings, read methodology)
    - Define UX/UI principles for this project
    - Produce page-by-page UX specification (see Section 10)
    - Describe wireframe-level layouts for each page
    - Define design system (typography, spacing, color, components)
    - Record ADR-002: Design system and component library choice
  Visual direction:
    - Clean, minimal, professional
    - Financial-dashboard style
    - Neutral and serious
    - Desktop-first but responsive

--------------------------------------------------------------------------------
AGENT 3: SOLUTION ARCHITECT
--------------------------------------------------------------------------------
  Role:        Define system design, APIs, security, deployment architecture.
  Trigger:     Assigned by Orchestrator for Phase 3.
               Also reviews Phase 4 integration design.
  Input:       MVP scope (from Agent 1), UX spec (from Agent 2), product context.
  Output:      High-level system architecture, tech stack recommendation,
               frontend architecture, backend architecture, data storage schema,
               API route design.
  Artifacts:   wiki/architecture/system-architecture.md,
               wiki/architecture/data-storage-schema.md,
               wiki/architecture/api-routes.md,
               wiki/modules/frontend.md, wiki/modules/backend.md,
               wiki/conventions/coding-conventions.md.
  Tools:       File system (wiki write), terminal (architecture validation).
  Quality gate: Architecture supports all UX flows (cross-checked against Agent 2
                output). Security boundaries are defined. Public/private data
                separation is explicit. Data storage schema covers all holding
                fields and portfolio settings.
  Responsibilities:
    - Design high-level architecture (frontend/backend split, data flow)
    - Recommend and justify tech stack for MVP using the evaluation criteria
      below (ADR-003 must include the scored matrix)
    - Define frontend architecture (framework, components, state, routing)
    - Define backend architecture (framework, middleware, services)
    - Propose data storage schema using markdown/JSON files per Section 3
      constraints (file layout, naming, format, read/write patterns)
    - Design API routes with request/response shapes
    - Define authentication and authorization model
    - Define deployment architecture targeting GitHub-hosted workflows
    - Specify caching design (file-based), monitoring, and logging
    - Define how public and private data are separated safely
    - Record ADR-003 (tech stack), ADR-004 (data storage format), ADR-005 (auth)

  Tech stack evaluation criteria (mandatory for ADR-003):
    Agent 3 must evaluate candidate tech stacks against these criteria.
    Each criterion is scored 1-5. The ADR must include the scoring matrix
    and justification for the selected stack.

    1. MVP speed        — time to working prototype with one developer
    2. Simplicity       — minimal moving parts, single-language where possible
    3. GitHub ecosystem  — Actions support, templates, community packages
    4. Maintainability  — code readability, type safety, refactorability
    5. Deployment ease  — containerizable, standard build pipeline, no exotic deps
    6. Alpha Vantage fit — HTTP client maturity, JSON handling, async support
    7. Security posture — auth libraries, secret management, OWASP coverage
    8. Scalability path — can grow beyond MVP without rewrite
    9. Team familiarity — if known, weight toward team's existing skills
    10. Cost            — free tier viability, license constraints

    Minimum candidates to evaluate: at least 2 options per layer
    (e.g., React vs Vue for frontend, Node/Express vs Python/FastAPI
    for backend, markdown-with-YAML-frontmatter vs JSON for data files).

    Note: The data storage layer uses file-based persistence per Section 3.
    ADR-004 evaluates file format (markdown vs JSON), not database engines.

    The selected stack must score highest overall. If two stacks tie,
    prefer the simpler one (principle: avoid over-engineering the MVP).

--------------------------------------------------------------------------------
AGENT 4: FULL-STACK ENGINEER
--------------------------------------------------------------------------------
  Role:        Implement code based on specs from Agents 2 and 3.
  Trigger:     Assigned by Orchestrator for code implementation (post-Phase 6).
  Input:       All wiki specs from Phases 1-6.
  Output:      Working code, component implementations, API endpoints,
               data file templates and read/write utilities.
  Artifacts:   Source code files, wiki/modules/ updates with implementation notes.
  Tools:       File system (code read/write), terminal (build, test, run),
               grep/search (codebase navigation).
  Quality gate: Code compiles, tests pass, implements the spec without scope creep,
                follows coding conventions from wiki/conventions/coding-conventions.md.
  Responsibilities:
    - Implement frontend components per UX spec
    - Implement backend API routes per API design
    - Implement data storage layer (file read/write utilities for
      markdown/JSON files in data/ directory)
    - Create data file templates (initial holding, settings, cache files)
    - Implement Alpha Vantage integration per Agent 5 spec
    - Implement benchmark comparison logic per return methodology
    - Implement publish/unpublish and public page rendering
    - Implement validation (client and server side)
    - Follow coding conventions and design system

--------------------------------------------------------------------------------
AGENT 5: DATA/API INTEGRATION DESIGNER
--------------------------------------------------------------------------------
  Role:        Design Alpha Vantage integration, benchmark logic,
               return calculations.
  Trigger:     Assigned by Orchestrator for Phase 4.
  Input:       Alpha Vantage requirements (Section 7), benchmark requirements
               (Section 6), data storage schema (from Agent 3).
  Output:      Integration flow design, rate-limit strategy, benchmark comparison
               methodology, return calculation definitions, data normalization rules.
  Artifacts:   wiki/modules/alpha-vantage-service.md,
               wiki/modules/benchmark-engine.md,
               wiki/concepts/return-calculations.md,
               wiki/concepts/benchmark-methodology.md.
  Tools:       File system (wiki write), web fetch (Alpha Vantage API docs).
  Quality gate: Integration handles all edge cases (rate limits, missing data,
                non-trading days). Return calculations are mathematically correct
                and clearly documented. Benchmark methodology is practical with
                Alpha Vantage constraints. Architect (Agent 3) confirms design is
                compatible with system architecture.
  Responsibilities:
    - Design Alpha Vantage request lifecycle and response validation
    - Define rate-limit mitigation (queuing, backoff, caching)
    - Define symbol mapping and validation flow
    - Design benchmark data handling (SPY proxy recommendation if applicable)
    - Define historical price normalization and date alignment logic
    - Define handling for non-trading days and missing data
    - Define update schedules and fallback rules
    - Define return calculation methodology:
        - holding market value, gain/loss, gain/loss percentage
        - portfolio allocation percentage
        - total portfolio value
        - cumulative portfolio return and benchmark return
        - relative outperformance / underperformance
    - Explain how benchmark and portfolio time periods align
    - Record ADR-006: Benchmark proxy selection

--------------------------------------------------------------------------------
AGENT 6: QA/TEST ENGINEER
--------------------------------------------------------------------------------
  Role:        Define test strategy, validate quality, assess release readiness.
  Trigger:     Assigned by Orchestrator for Phase 5.
               Also reviews every other phase output for testability.
  Input:       All prior phase deliverables.
  Output:      Test strategy, test scenarios, regression priorities, error state
               catalog, accessibility audit checklist, release-readiness checklist.
  Artifacts:   wiki/architecture/security-model.md,
               wiki/conventions/testing-conventions.md,
               wiki/conventions/accessibility-standards.md,
               wiki/architecture/deployment.md.
  Tools:       File system (wiki write), terminal (test execution).
  Quality gate: Test plan covers all critical paths. Security scenarios are
                enumerated. Calculation validation scenarios exist. Accessibility
                standards are defined. Every agent's output has been reviewed
                for testability.
  Responsibilities:
    - Define test strategy (unit, integration, E2E, manual)
    - Create risk-based test plan prioritized by impact
    - Define test scenarios for:
        - security and authorization
        - API failure and degraded operation
        - return calculation accuracy
        - responsive layout and accessibility
    - Catalog error states and edge cases across all features
    - Define accessibility audit criteria
    - Define SEO guidance for public page
    - Define deployment and operational considerations
    - Produce release-readiness checklist

--------------------------------------------------------------------------------
AGENT 7: VISUAL TEST AGENT
--------------------------------------------------------------------------------
  Role:        Launch the running application, visually inspect pages, interact
               with the UI, take screenshots, validate rendered output against
               UX specs, and run automated browser-based test scenarios.
  Trigger:     Assigned by Orchestrator during Phase 7 (Implementation and
               Visual Validation). Also activated on-demand when Agent 4
               completes a feature or when Agent 6 requests visual verification.
  Input:       Running application URL, UX specs (from Agent 2), test scenarios
               (from Agent 6), accessibility standards (from Agent 6),
               design system (from wiki/conventions/design-system.md).
  Output:      Screenshot evidence per page, visual test pass/fail report,
               accessibility audit results, interaction test results,
               regression comparison screenshots, bug reports with reproduction
               steps.
  Artifacts:   wiki/test-results/visual-test-report.md,
               wiki/test-results/accessibility-audit.md,
               wiki/test-results/screenshots/ (evidence folder).
  Tools:
    Browser automation (Playwright MCP):
      - mcp_microsoft_pla_browser_navigate — open pages
      - mcp_microsoft_pla_browser_snapshot — read DOM structure
      - mcp_microsoft_pla_browser_take_screenshot — capture visual evidence
      - mcp_microsoft_pla_browser_click — interact with elements
      - mcp_microsoft_pla_browser_fill_form — test form inputs
      - mcp_microsoft_pla_browser_evaluate — run JS assertions
      - mcp_microsoft_pla_browser_network_requests — verify API calls
      - mcp_microsoft_pla_browser_resize — test responsive breakpoints
      - mcp_microsoft_pla_browser_press_key — test keyboard navigation
      - mcp_microsoft_pla_browser_console_messages — catch JS errors
    VS Code integrated browser:
      - open_browser_page, read_page, click_element, screenshot_page
    File system (wiki write for reports).
    Terminal (start/stop dev server).
  Quality gate: Every page defined in Section 10 has been visually verified.
                All interactive flows (admin CRUD, publish/unpublish) have been
                exercised end-to-end in the browser. Accessibility checks pass
                (keyboard nav, focus states, contrast). No console errors on
                any page. Screenshots match UX spec expectations. Responsive
                layout verified at desktop (1280px) and mobile (375px).
  Responsibilities:
    - Start the development server via terminal
    - Navigate to every page defined in Section 10 and take a screenshot
    - Compare rendered pages against wireframe/UX spec from Agent 2
    - Execute interactive test scenarios from Agent 6:
        - Admin login flow
        - Add/edit/archive/delete a holding
        - Toggle holding visibility
        - Refresh market data
        - Preview and publish/unpublish public page
        - View public portfolio page as an external visitor
    - Test form validation (submit empty, submit invalid ticker, etc.)
    - Test responsive layout by resizing to mobile breakpoints
    - Test keyboard navigation (tab order, focus states, enter/escape)
    - Inspect network requests to verify API calls match route design
    - Check browser console for JavaScript errors or warnings
    - Verify that quantity is never exposed on the public page
    - Verify that unpublished pages return 404 or redirect
    - Verify that hidden holdings do not appear in public API responses
    - Produce a structured visual test report with pass/fail per page
    - File bug reports for failures with screenshot + DOM snapshot evidence
  Test cycle protocol:
    1. Agent 4 completes a feature and notifies Orchestrator
    2. Orchestrator activates Agent 7 to test that feature
    3. Agent 7 runs visual + interaction tests, produces report
    4. If failures found: Agent 7 files bug report, Orchestrator routes
       to Agent 4 for fix, then Agent 7 re-tests
    5. If all pass: Agent 7 marks feature as visually verified
    6. After all features pass, Agent 7 runs full regression suite
    7. Regression report feeds into Agent 6's release-readiness assessment

================================================================================
SECTION 9 — ORCHESTRATION PROTOCOL
================================================================================

A. PHASE GATE PROCESS
   For each phase:
   1. Orchestrator reads wiki/log.md to confirm prior phase is complete
   2. Orchestrator assigns LEAD agent and CONTRIBUTING agents (see Section 12)
   3. Lead agent produces deliverables, consulting contributing agents as needed
   4. Orchestrator routes deliverables to REVIEWER agent(s) (see Section 12)
   5. Reviewer agent(s) provide structured feedback:
      PASS, PASS WITH NOTES, or REVISE
   6. If REVISE:
      a. Lead agent addresses feedback
      b. Lead agent updates the wiki artifact with revisions
      c. Lead agent appends revision note to wiki/log.md:
         format: "[Phase N] Revision R — [what changed] — [reviewer who requested]"
      d. Re-submit for review
      e. Max 3 revision cycles per phase; after that, escalate to user
   7. If PASS or PASS WITH NOTES:
      a. Orchestrator writes deliverables to wiki (status: final)
      b. Orchestrator appends phase completion to wiki/log.md
      c. Orchestrator updates wiki/index.md with new/modified pages
      d. Orchestrator updates wiki/overview.md if project state changed
      e. Orchestrator activates the next phase

B. HANDOFF FORMAT
   Every agent-to-agent handoff is a wiki artifact. The format is:
   - File path: as specified in agent output artifacts
   - Content: structured markdown with clear headings
   - Metadata header: phase number, lead agent, date, status
     (draft / reviewed / final)
   - Downstream agents reference artifacts by wiki path,
     never by inline content

C. CONFLICT RESOLUTION
   When two agents disagree (e.g., Architect recommends JSON files but Engineer
   prefers markdown with YAML frontmatter for data storage):
   1. Both agents state their position with rationale in a structured format:
      POSITION, RATIONALE, TRADEOFFS, RECOMMENDATION
   2. Orchestrator evaluates against project principles (Section 4) and MVP scope
   3. If resolution is clear from principles, Orchestrator decides and records
      an ADR
   4. If resolution is ambiguous, Orchestrator escalates to the user with both
      positions
   5. Decision is recorded as an ADR in wiki/decisions/

D. INTER-AGENT REVIEW MATRIX
   Each phase has designated reviewers who cross-validate the lead agent's work:

   Phase 1 output reviewed by:
     Agent 2 (scope vs UX feasibility)
     Agent 6 (scope vs testability)

   Phase 2 output reviewed by:
     Agent 1 (design vs MVP scope)
     Agent 3 (design vs technical feasibility)

   Phase 3 output reviewed by:
     Agent 2 (architecture vs UX requirements)
     Agent 5 (architecture vs data integration needs)
     Agent 6 (architecture vs testability)

   Phase 4 output reviewed by:
     Agent 3 (integration vs system architecture)
     Agent 6 (integration vs test coverage)

   Phase 5 output reviewed by:
     Agent 3 (security model vs architecture)
     Agent 1 (operational plan vs roadmap)

   Phase 6 output reviewed by:
     All agents (final sign-off)

   Phase 7 output (code + visual tests) reviewed by:
     Agent 7 (visual verification of every feature)
     Agent 6 (test coverage and release readiness)
     Agent 3 (architectural compliance)
     Agent 2 (UX spec compliance via Agent 7 screenshots)

E. REVIEW FEEDBACK FORMAT
   Reviewers provide feedback as:
   - VERDICT: PASS | PASS WITH NOTES | REVISE
   - ITEMS: numbered list of specific issues or observations
   - For REVISE: each item must state WHAT is wrong and WHY,
     with a suggested fix
   - For PASS WITH NOTES: items are advisory, not blocking

F. CONTINUOUS DOCUMENTATION PROTOCOL
   Wiki updates are mandatory at every state transition, not just phase
   boundaries. The following events require immediate wiki updates:

   1. DELIVERABLE PRODUCED — write artifact to wiki with status: draft
   2. REVIEW SUBMITTED — update artifact status to: reviewed
   3. REVISION MADE — update artifact in-place, append revision note
      to wiki/log.md
   4. PHASE COMPLETED — update artifact status to: final, update
      wiki/log.md, wiki/index.md, wiki/overview.md
   5. FEATURE IMPLEMENTED (Phase 7) — append to wiki/log.md, update
      wiki/modules/ with implementation notes
   6. BUG FOUND (Phase 7) — create entry in wiki/test-results/bug-log.md
   7. BUG FIXED (Phase 7) — update bug-log.md status, append fix note
      to wiki/log.md
   8. FEATURE VERIFIED (Phase 7) — append verification to wiki/log.md
   9. SPEC AMENDED — update original spec wiki page, record rationale
      in wiki/log.md, update wiki/index.md if page was renamed
   10. CONFLICT RESOLVED — record ADR in wiki/decisions/, append to
       wiki/log.md

   The Orchestrator enforces this protocol. No state transition is
   considered complete until the corresponding wiki update is confirmed.

================================================================================
SECTION 10 — REQUIRED FEATURES (DOMAIN SPEC)
================================================================================

ADMIN PAGES

1. Admin Dashboard
- total portfolio value
- total gain/loss
- daily change
- benchmark comparison summary
- holdings count
- last data refresh timestamp
- quick actions

2. Holdings Management
- searchable and sortable table
- add holding
- edit holding
- archive/delete holding
- visibility toggle
- bulk actions
- filter by status, sector, or visibility
- pagination: MVP must support paginated display if holdings exceed 20 rows;
  Agent 2 defines the pagination UX, Agent 3 defines the API pagination
  contract (offset/limit or cursor-based)

3. Add/Edit Holding Form
- professional form layout
- clear validations
- save and cancel flow
- error handling for invalid ticker or missing fields

4. Performance Page
- portfolio return chart
- benchmark return chart
- relative performance
- date range filters
- summary metrics

5. Settings Page
- portfolio title
- subtitle
- description
- disclaimer
- benchmark setting
- public visibility
- SEO metadata
- public slug
- refresh preferences

6. Public Preview Page
- preview exactly what public visitors will see
- desktop and mobile preview
- publish/unpublish control
- Preview mechanism: Agent 2 must specify whether preview is rendered as
  a dedicated route (e.g., /admin/preview), an iframe embed, or an
  in-page modal. Agent 3 must confirm the chosen approach is technically
  feasible and define the route or component in the API/frontend spec.
- Publish/unpublish mechanism: this is an open design question. Agent 3
  must define the implementation approach (e.g., a boolean flag in
  data/settings that controls route-level access, a static build toggle,
  or a feature flag) and record the decision in the system architecture.
  The public page must return 404 or redirect when unpublished.

PUBLIC PAGE SECTIONS

1. Header / Hero
- portfolio title
- short description
- return summary
- last updated date
- disclaimer if needed

2. Portfolio Overview
- total value
- total return
- holdings count
- top holdings
- allocation summary

3. Holdings Table
- ticker
- company name
- weight
- market value
- gain/loss
- public notes if enabled
- pagination: if holdings exceed 20 rows, the public table must paginate
  or use progressive disclosure (e.g., "Show all" toggle)

4. Performance Section
- portfolio vs S&P 500 chart
- date range selector
- performance summary

5. Methodology / Disclosure
- data source
- return calculation summary
- update logic
- informational disclaimer

================================================================================
SECTION 11 — CROSS-CUTTING REQUIREMENTS
================================================================================

A. RETURN CALCULATION REQUIREMENTS
Define a practical v1 methodology for:
- holding market value
- holding gain/loss
- holding gain/loss percentage
- portfolio allocation percentage
- total portfolio value
- cumulative portfolio return
- benchmark cumulative return
- relative outperformance / underperformance

Also explain:
- how benchmark and portfolio time periods are aligned
- how to treat missing dates
- how to handle non-trading days
- how to keep calculations understandable for users

B. SECURITY REQUIREMENTS
The solution must ensure:
- admin routes require authentication
- public routes are read-only
- hidden holdings never appear publicly
- unpublished pages are not public
- API keys are never exposed client-side
- only authorized users can modify portfolio data
- destructive actions require confirmation
- basic auditability is considered for admin changes

C. ACCESSIBILITY REQUIREMENTS
The UX/UI must include:
- keyboard navigability
- clear focus states
- sufficient color contrast
- semantic tables
- labeled form controls
- heading hierarchy
- chart accessibility fallback text
- responsive layout behavior

D. SUCCESS METRICS
Quantitative thresholds that define a successful MVP. These complement the
qualitative requirements in Sections 11B (security) and 11C (accessibility)
by adding measurable pass/fail targets. Validated during Phase 7 by Agent 7
and Agent 6 before release sign-off.

  Performance:
    - Largest Contentful Paint (LCP): < 2.5s on desktop, < 4s on mobile
    - API response time (p95): < 500ms for cached data, < 3s for live fetch
    - Time to Interactive (TTI): < 3.5s on desktop
    - Core Web Vitals: pass on both desktop and mobile (per Google thresholds)

  Reliability:
    - Data freshness: market data no more than 24 hours stale on trading days
    - Cache hit rate: > 80% of Alpha Vantage requests served from cache
      during normal operation

  Accuracy:
    - Return calculations: match manual spreadsheet verification within
      plus or minus 0.01%
    - Allocation percentages: sum to 100% (within floating-point tolerance)
    - Benchmark alignment: portfolio and benchmark use identical date ranges
      with no off-by-one errors

  Code quality:
    - Test coverage: > 80% line coverage on backend business logic
      (return calculations, data operations, API routes)
    - Zero known critical or high-severity bugs at release
    - All linting rules pass with no suppressed warnings in production code

  Accessibility:
    - Lighthouse accessibility score: >= 90 on both admin and public pages

================================================================================
SECTION 12 — PHASED EXECUTION PLAN
================================================================================

Work through these phases in order. No phase starts until the prior phase passes
its quality gate and review cycle.

PHASE 1 — PRODUCT AND SCOPE
  Lead:          Agent 1 (Product Strategist)
  Contributors:  Agent 6 (testability input)
  Reviewers:     Agent 2 (UX feasibility), Agent 6 (testability)
  Deliverables:
    1. Executive summary
    2. Product vision and goals
    3. User roles and user needs
    4. MVP scope and non-MVP scope
  Wiki outputs:
    - wiki/analyses/mvp-scope.md
    - wiki/concepts/user-roles.md
    - wiki/overview.md (update with project vision)
  Decision to record:
    - ADR-001: MVP scope boundaries
  Gate criteria:
    - Every feature classified as MVP or future
    - Assumptions are listed explicitly
    - Agent 2 confirms scope is designable
    - Agent 6 confirms scope is testable

PHASE 2 — UX AND DESIGN
  Lead:          Agent 2 (UX/UI Designer)
  Contributors:  Agent 1 (scope guardrails)
  Reviewers:     Agent 1 (MVP scope compliance), Agent 3 (technical feasibility)
  Deliverables:
    5. Information architecture / sitemap
    6. Admin user flows
    7. Public user flows
    8. UX/UI design principles
    9. Page-by-page UX specification
    10. Wireframe-level layout descriptions
    11. Design system guidance
  Wiki outputs:
    - wiki/architecture/information-architecture.md
    - wiki/conventions/design-system.md
    - wiki/modules/admin-portal.md (UX spec)
    - wiki/modules/public-page.md (UX spec)
  Decision to record:
    - ADR-002: Design system and component library choice
  Gate criteria:
    - Every page has layout, empty state, loading state, error state
    - All admin flows have happy path + error path
    - Admin and public user flows include Mermaid flowchart diagrams
    - Public page never exposes quantity
    - Agent 1 confirms no scope creep
    - Agent 3 confirms designs are technically implementable

PHASE 3 — TECHNICAL ARCHITECTURE
  Lead:          Agent 3 (Solution Architect)
  Contributors:  Agent 4 (implementation feasibility), Agent 5 (data needs)
  Reviewers:     Agent 2 (UX requirements met), Agent 5 (integration compatibility),
                 Agent 6 (testability)
  Deliverables:
    12. High-level system architecture
    13. Recommended tech stack
    14. Frontend architecture
    15. Backend architecture
    16. Data storage schema (file layout, format, read/write patterns)
    17. API route design
  Wiki outputs:
    - wiki/architecture/system-architecture.md
    - wiki/architecture/data-storage-schema.md
    - wiki/architecture/api-routes.md
    - wiki/modules/frontend.md
    - wiki/modules/backend.md
    - wiki/conventions/coding-conventions.md
  Decisions to record:
    - ADR-003: Tech stack selection
    - ADR-004: Data storage format (markdown vs JSON) and file layout
    - ADR-005: Authentication and authorization approach
  Gate criteria:
    - Architecture supports all UX flows from Phase 2
    - System architecture wiki page includes a Mermaid architecture diagram
    - Data storage schema covers all holding fields plus portfolio settings
    - File layout for data/ directory is fully specified
    - Read/write patterns are defined (how to list, get, create, update, delete)
    - API routes map to every admin and public feature
    - Security boundaries are defined (public vs private)
    - Agent 5 confirms architecture supports Alpha Vantage integration
    - Agent 6 confirms architecture is testable

PHASE 4 — DATA AND INTEGRATION
  Lead:          Agent 5 (Data/API Integration Designer)
  Contributors:  Agent 3 (architecture constraints)
  Reviewers:     Agent 3 (architecture compatibility), Agent 6 (test coverage)
  Deliverables:
    18. Alpha Vantage integration design
    19. Benchmark comparison design
    20. Return calculation methodology
  Wiki outputs:
    - wiki/modules/alpha-vantage-service.md
    - wiki/modules/benchmark-engine.md
    - wiki/concepts/return-calculations.md
    - wiki/concepts/benchmark-methodology.md
  Decision to record:
    - ADR-006: Benchmark proxy selection (SPY vs alternatives)
  Gate criteria:
    - Integration handles rate limits, missing data, non-trading days
    - Alpha Vantage integration wiki page includes a Mermaid sequence diagram
    - Return calculation flow includes a Mermaid flowchart diagram
    - Return calculations are mathematically defined with examples
    - Benchmark methodology is practical within Alpha Vantage constraints
    - Agent 3 confirms design fits within system architecture
    - Agent 6 confirms calculations are testable with concrete test cases

PHASE 5 — SECURITY, QUALITY, AND OPERATIONS
  Lead:          Agent 6 (QA/Test Engineer)
  Contributors:  Agent 3 (security model input), Agent 2 (accessibility input)
  Reviewers:     Agent 3 (security model review), Agent 1 (operational alignment)
  Deliverables:
    21. Security and authorization model
    22. QA and testing strategy
    23. Test scenarios and regression priorities
    24. Error states and edge cases
    25. Accessibility guidance
    26. SEO guidance for public page
    27. Deployment and operational considerations
  Wiki outputs:
    - wiki/architecture/security-model.md
    - wiki/conventions/testing-conventions.md
    - wiki/conventions/accessibility-standards.md
    - wiki/architecture/deployment.md
  Gate criteria:
    - Security model covers all requirements from Section 11B
    - Test plan has concrete scenarios for every critical path
    - Accessibility standards cover all requirements from Section 11C
    - Agent 3 confirms security model is architecturally sound
    - Agent 1 confirms operational plan aligns with roadmap

PHASE 6 — ROADMAP AND IMPLEMENTATION PLANNING
  Lead:          Agent 1 (Product Strategist)
  Contributors:  Agent 3 (technical effort input), Agent 4 (implementation input)
  Reviewers:     All agents (final sign-off)
  Deliverables:
    28. Phase-based delivery roadmap
    29. Key risks and tradeoffs
    30. Final implementation recommendation for MVP
  Wiki outputs:
    - wiki/analyses/risk-tradeoff-analysis.md
    - wiki/analyses/implementation-roadmap.md
    - wiki/overview.md (final update with complete project state)
  Gate criteria:
    - Roadmap references concrete wiki artifacts for every task
    - Risks have mitigations and owners
    - All agents confirm their domain is accurately represented
    - wiki/overview.md reflects the complete project state

After Phase 6 passes its gate, the wiki contains the full living specification.
Phase 7 begins the build-and-verify cycle.

PHASE 7 — IMPLEMENTATION AND VISUAL VALIDATION
  Lead:          Agent 4 (Full-Stack Engineer)
  Contributors:  Agent 5 (integration implementation), Agent 3 (architecture)
  Reviewers:     Agent 7 (visual testing), Agent 6 (quality/release readiness),
                 Agent 3 (architectural compliance)
  Execution model:
    This phase operates in iterative feature cycles, not a single pass.
    Each cycle follows the Build-Test-Fix loop:

    1. Agent 4 implements a feature per wiki spec
    2. Agent 4 writes unit tests for the feature
    3. Agent 4 updates wiki documentation:
       a. Append to wiki/log.md: "[Phase 7] Feature: [name] — implemented"
       b. Update wiki/modules/ with implementation notes
          (deviations from spec, technical decisions, known limitations)
       c. If implementation required a spec change, update the original
          wiki spec and record rationale in wiki/log.md
    4. Orchestrator activates Agent 7 to visually test the feature:
       a. Agent 7 starts the dev server
       b. Agent 7 navigates to the relevant pages
       c. Agent 7 takes screenshots and runs interaction tests
       d. Agent 7 checks accessibility (keyboard, contrast, focus)
       e. Agent 7 verifies no console errors
       f. Agent 7 produces a pass/fail report with evidence
       g. Agent 7 writes results to wiki/test-results/:
          - Append to visual-test-report.md (per-feature section)
          - Save screenshots to wiki/test-results/screenshots/
    5. If Agent 7 finds failures:
       a. Bug report filed with screenshot + DOM snapshot
       b. Bug logged in wiki/test-results/bug-log.md:
          format: "BUG-[N] | [feature] | [severity] | [description] | [status]"
       c. Orchestrator routes to Agent 4 for fix
       d. Agent 4 fixes and updates wiki/log.md:
          "[Phase 7] Fix: BUG-[N] — [what changed]"
       e. Agent 7 re-tests (max 3 revision cycles per feature,
          then escalate to user)
       f. On fix verified, update bug-log.md status to CLOSED
    6. If Agent 7 passes: feature marked as verified in wiki/log.md:
       "[Phase 7] Verified: [feature] — visual + interaction tests pass"
    7. Agent 6 reviews test coverage after each feature batch:
       a. Updates wiki/conventions/testing-conventions.md with
          coverage observations
       b. Flags any gaps in wiki/log.md

  Feature implementation order (suggested, Orchestrator may adjust):
    Batch 1: Project setup, data storage layer, backend API scaffold
    Batch 2: Admin authentication, admin dashboard
    Batch 3: Holdings CRUD (add, edit, archive, delete)
    Batch 4: Alpha Vantage integration, market data refresh
    Batch 5: Performance calculations, benchmark comparison
    Batch 6: Settings, publish/unpublish, public page rendering
    Batch 7: Public portfolio page (all sections)
    Batch 8: Final polish, responsive, accessibility

  Wiki outputs (continuously updated throughout this phase):
    - wiki/log.md (append per feature: implement, test, fix, verify)
    - wiki/test-results/visual-test-report.md (per-feature sections)
    - wiki/test-results/accessibility-audit.md (updated per batch)
    - wiki/test-results/bug-log.md (all bugs with status tracking)
    - wiki/test-results/screenshots/ (evidence per page per batch)
    - wiki/modules/ (implementation notes, spec deviations)
    - wiki/index.md (updated when new wiki pages are created)
    - wiki/overview.md (updated at end of each batch with progress)

  Documentation checkpoints:
    After each feature batch completes:
    1. Orchestrator verifies wiki/log.md has entries for every feature
       in the batch (implement + test + verify)
    2. Orchestrator verifies wiki/test-results/ has current reports
    3. Orchestrator updates wiki/overview.md with batch completion status
    4. Orchestrator updates wiki/index.md if new pages were created
    5. If any spec was amended during implementation, Orchestrator
       verifies the amendment is recorded with rationale

  Gate criteria:
    - All features from wiki specs are implemented
    - Unit tests pass for all backend routes and calculations
    - Agent 7 has visually verified every page in Section 10
    - Agent 7 confirms public page never exposes quantity
    - Agent 7 confirms unpublished page returns 404
    - Agent 7 confirms hidden holdings absent from public view
    - Responsive layout verified at 1280px and 375px
    - Keyboard navigation works on all interactive elements
    - No unhandled console errors on any page
    - All success metrics from Section 11D are validated:
        - LCP < 2.5s desktop, < 4s mobile; TTI < 3.5s; Core Web Vitals pass
        - API p95 < 500ms cached, < 3s live
        - Data freshness < 24h on trading days; cache hit rate > 80%
        - Return calculations within +/- 0.01% of manual verification
        - Allocation percentages sum to 100%
        - Lighthouse accessibility >= 90
        - Backend test coverage > 80%; zero critical bugs; linting clean
    - Agent 6 signs off on release-readiness checklist
    - Agent 3 confirms no architectural deviations

  End state:
    When Phase 7 gate passes, the application is functionally complete,
    visually verified, and ready for documentation and deployment.
    Phase 8 begins the documentation finalization.

PHASE 8 — DOCUMENTATION AND README
  Lead:          Agent 4 (Full-Stack Engineer)
  Contributors:  Agent 1 (product context), Agent 3 (architecture overview),
                 Agent 5 (integration details), Agent 6 (test/run instructions)
  Reviewers:     Agent 1 (completeness), Agent 3 (accuracy)
  Trigger:       Phase 7 gate passes.

  Deliverables:
    1. README.md at the repository root with the sections listed below
    2. All architectural and data-flow diagrams in Mermaid syntax
    3. Wiki documentation cross-referenced from README

  README.md required sections:
    1. Project title and one-line description
    2. Project overview (purpose, admin portal vs public page)
    3. Architecture overview with Mermaid diagram:
       - System architecture (frontend, backend, data files, Alpha Vantage)
       - Request flow (client -> API -> data files / Alpha Vantage -> response)
    4. Tech stack table (framework, version, purpose)
    5. Prerequisites (runtime versions, API keys, tools)
    6. Getting started:
       - Clone instructions
       - Environment setup (.env file, API keys)
       - Install dependencies
       - Data directory setup (initial file templates)
       - Start development server
    7. Project structure (directory tree with descriptions)
    8. Admin portal features summary
    9. Public page features summary
    10. API reference (route, method, auth required, description)
        — or link to full API docs if generated
    11. Authentication and authorization summary
    12. Alpha Vantage integration:
        - Setup (API key)
        - Rate limits and caching
        - Supported endpoints
    13. Benchmark methodology summary with Mermaid flow:
        - Data fetch -> normalize -> calculate returns -> compare
    14. Return calculation summary (formulas or pseudocode)
    15. Testing:
        - How to run unit tests
        - How to run integration tests
        - How to run visual tests (Agent 7 protocol)
    16. Deployment:
        - GitHub Actions CI/CD pipeline description with Mermaid diagram
        - Environment variables reference
        - Production deployment steps
    17. Contributing guidelines (branch strategy, PR process, commit format)
    18. License
    19. Disclaimer (financial data disclaimer)

  Mermaid diagram requirements:
    All flow diagrams, architecture diagrams, and sequence diagrams in the
    README and wiki must use Mermaid syntax (```mermaid code blocks).
    Do not use image files for diagrams that can be expressed in Mermaid.

    Required Mermaid diagrams (minimum):
    1. System architecture — flowchart showing frontend, backend, data files,
       Alpha Vantage API, and user types (admin vs public)
    2. Admin user flow — flowchart from login through dashboard, holdings
       management, settings, preview, publish
    3. Public page flow — flowchart from page load through data fetch
       and rendering
    4. Alpha Vantage integration — sequence diagram showing request,
       cache check, API call, rate limit handling, response
    5. Build-Test-Fix cycle — flowchart showing Agent 4 build, Agent 7
       test, pass/fail routing, wiki updates
    6. CI/CD pipeline — flowchart from push to GitHub through Actions
       (lint, test, build, deploy)
    7. Data flow for return calculations — flowchart from raw price data
       through normalization, calculation, and display

    Additionally, any flow described in wiki documentation must include
    a Mermaid diagram. When Agent 2 produces user flows in Phase 2,
    Agent 3 produces architecture in Phase 3, or Agent 5 produces
    integration flows in Phase 4, those deliverables must include
    Mermaid diagrams in the wiki artifacts. Agent 4 consolidates
    the relevant diagrams into README.md during Phase 8.

  Wiki outputs:
    - wiki/log.md (Phase 8 completion entry)
    - wiki/index.md (updated with README reference)
    - wiki/overview.md (final state: documentation complete)

  Gate criteria:
    - README.md exists at repository root
    - All 19 sections are present and non-empty
    - At least 7 Mermaid diagrams are included
    - Mermaid diagrams render correctly (validated via preview)
    - Getting started instructions are testable (Agent 7 can follow them
      from a clean state to a running dev server)
    - API reference matches implemented routes
    - Agent 1 confirms product context is accurately represented
    - Agent 3 confirms architecture diagram matches implementation

  End state:
    When Phase 8 gate passes, the application is fully documented,
    visually verified, and ready for deployment.
    The Orchestrator continues to manage session protocol for any
    subsequent maintenance or enhancement cycles.

================================================================================
SECTION 13 — DELIVERY RULES
================================================================================

- Be concrete, not generic
- Prefer simple solutions first
- Call out where assumptions are being made
- Show sample tables, fields, and page sections where useful
- Keep the UI professional and clean
- Do not introduce unnecessary complexity
- When recommending tools or architecture, explain why they fit this use case
- Where possible, separate "MVP must-have" from "future enhancement"
- Always persist phase outputs to the wiki before moving on
- Never silently override a prior decision — read the ADR first, then propose
  an amendment if needed
- Every phase must pass its quality gate and review cycle before proceeding
- Conflicts between agents are resolved through the conflict resolution protocol
- The Orchestrator is the single point of control for phase transitions
