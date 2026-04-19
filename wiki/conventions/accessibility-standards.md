---
title: "Accessibility Standards"
type: convention
created: 2026-04-14
updated: 2026-04-14
tags: [accessibility, a11y, wcag, phase-5]
sources: [raw/prompt.md]
related: [design-system, public-page, admin-portal]
status: final
phase: 5
lead: Agent 6 (QA/Test Engineer)
---

# Accessibility Standards

## Target

- WCAG 2.1 Level AA compliance
- Lighthouse accessibility score >= 90

## Requirements

### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order (follows visual layout)
- Skip-to-content link as first focusable element
- Enter activates buttons and links
- Escape closes modals and dropdowns
- Arrow keys navigate within menus and tables

### Focus States
- Visible focus ring on all focusable elements (2px `--color-primary` outline)
- Focus not trapped (except in modals — trap focus within modal until closed)
- Focus returned to trigger element when modal closes

### Color and Contrast
- Text contrast ratio >= 4.5:1 (WCAG AA for normal text)
- Large text contrast >= 3:1
- Color is never the sole indicator — gain/loss uses `+`/`-` prefix AND color
- UI remains usable in high-contrast mode

### Semantic HTML
- `<main>` for primary content
- `<nav>` for navigation regions
- `<section>` with accessible names for page sections
- `<table>`, `<thead>`, `<th scope="col|row">` for data tables
- `<caption>` on all tables
- `<form>`, `<label>`, `<fieldset>`, `<legend>` for forms
- `<button>` for actions (not `<div>` or `<span>`)
- `<a>` for navigation (not `<button>`)
- Heading hierarchy: H1 > H2 > H3 (no skipping levels)

### Forms
- Every input has a visible `<label>` (or `aria-label` for icon-only inputs)
- Required fields marked with `*` and `aria-required="true"`
- Error messages linked to fields via `aria-describedby`
- Success/error toasts announced via `aria-live="polite"`

### Charts
- Every chart has an `aria-label` with a text summary
- Example: "Line chart showing portfolio returned 25% over the past year compared to S&P 500 at 18.5%"
- Chart data available as a visually hidden table for screen readers

### Tables
- Sortable column headers indicate sort direction via `aria-sort`
- Pagination controls have clear labels
- "Showing X of Y holdings" announced on page changes
- Row actions have descriptive labels ("Edit AAPL", not just "Edit")

### Images and Icons
- Decorative icons have `aria-hidden="true"`
- Informational icons have `aria-label`
- No images in MVP (text-only UI)

## Audit Checklist

- [ ] Skip-to-content link present and functional
- [ ] All pages have unique `<title>`
- [ ] H1 present on every page, heading hierarchy correct
- [ ] All form inputs have associated labels
- [ ] All tables have captions and scoped headers
- [ ] All charts have aria-label text summaries
- [ ] Focus visible on all interactive elements
- [ ] Tab order follows visual layout
- [ ] Escape closes all modals/dropdowns
- [ ] Color contrast >= 4.5:1 (checked with tool)
- [ ] Gain/loss uses text indicators, not just color
- [ ] Error messages linked to fields via aria-describedby
- [ ] Toast notifications use aria-live
- [ ] No auto-playing content or flashing elements
- [ ] Lighthouse accessibility score >= 90
