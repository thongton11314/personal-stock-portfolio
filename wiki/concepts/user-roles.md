---
title: "User Roles"
type: concept
created: 2026-04-14
updated: 2026-04-14
tags: [users, roles, personas, phase-1]
sources: [raw/prompt.md]
related: [mvp-scope, security-model]
status: final
phase: 1
lead: Agent 1 (Product Strategist)
---

# User Roles

## Role 1: Portfolio Admin

- **Description**: The portfolio owner who manages holdings, settings, and public visibility.
- **Access**: Authenticated. Full read/write access to all admin routes.
- **Goals**:
  - Maintain accurate holdings data (add, edit, archive, delete)
  - Monitor portfolio performance against the S&P 500
  - Control what is publicly visible
  - Refresh market data on demand
  - Preview and publish/unpublish the public page
- **Constraints**:
  - Single user for MVP (no multi-user, no role hierarchy)
  - Must authenticate before accessing any admin functionality
  - All destructive actions (delete, unpublish) require confirmation
- **Key Workflows**:
  1. Login -> Dashboard -> Review performance
  2. Login -> Holdings -> Add/Edit/Archive holdings
  3. Login -> Settings -> Configure portfolio metadata
  4. Login -> Preview -> Review public page -> Publish/Unpublish
  5. Login -> Dashboard -> Refresh market data

## Role 2: Public Visitor

- **Description**: An external viewer who browses the published portfolio page.
- **Access**: Unauthenticated. Read-only access to the public page (when published).
- **Goals**:
  - View portfolio composition by allocation weight
  - Review portfolio performance vs. S&P 500
  - Understand the methodology and disclaimers
- **Constraints**:
  - Never sees holding quantities (number of shares)
  - Never sees holdings marked as hidden by the admin
  - Cannot access the page when it is unpublished (receives 404)
  - No ability to modify any data
  - No authentication required or offered
- **Key Workflows**:
  1. Navigate to public URL -> View portfolio overview
  2. Browse holdings table (weight, value, gain/loss)
  3. Review performance chart vs. benchmark
  4. Read methodology and disclaimer

## Data Visibility Matrix

| Data Field | Admin | Public Visitor |
|-----------|-------|---------------|
| Ticker | Yes | Yes (if visible) |
| Company Name | Yes | Yes (if visible) |
| Asset Type | Yes | Yes (if visible) |
| Quantity | Yes | **Never** |
| Average Cost | Yes | No |
| Purchase Date | Yes | No |
| Sector | Yes | Yes (if visible) |
| Notes | Yes | Yes (if enabled) |
| Market Value | Yes | Yes (if visible) |
| Weight (%) | Yes | Yes (if visible) |
| Gain/Loss | Yes | Yes (if visible) |
| Gain/Loss % | Yes | Yes (if visible) |
| Display Order | Yes (editable) | Determines sort order |
| Visibility Flag | Yes (editable) | Controls inclusion |
| Status (active/archived) | Yes | Archived = hidden |
