---
title: "Information Architecture"
type: architecture
created: 2026-04-14
updated: 2026-04-15
tags: [ia, sitemap, navigation, phase-2]
sources: [raw/prompt.md]
related: [mvp-scope, admin-portal, public-page, user-roles]
status: active
phase: 2
lead: Agent 2 (UX/UI Designer)
---

# Information Architecture

## Sitemap

```
/                           Public Portfolio Page (if published)
/login                      Admin Login
/admin                      Admin Dashboard
/admin/holdings             Holdings Management (table)
/admin/holdings/new         Add Holding Form
/admin/holdings/:ticker/edit Edit Holding Form
/admin/performance          Performance & Benchmark
/admin/transactions         Transaction History (all holdings)
/admin/settings             Portfolio Settings
/admin/preview              Public Page Preview + Publish Control
```

## Navigation Structure

### Admin Navigation (Sidebar)

```
[Logo / Portfolio Title]
--------------------------
Dashboard          /admin
Holdings           /admin/holdings
Performance        /admin/performance
Transactions       /admin/transactions
Settings           /admin/settings
Preview & Publish  /admin/preview
--------------------------
[Logout]
```

### Public Page Navigation (Single-page scrolling)

```
[Portfolio Title]
--------------------------
Overview           #overview
Holdings           #holdings
Performance        #performance
Methodology        #methodology
```

## Admin User Flow

```mermaid
flowchart TD
    A[Visit /admin] --> B{Authenticated?}
    B -->|No| C[Login Page]
    C --> D{Valid Credentials?}
    D -->|No| E[Show Error]
    E --> C
    D -->|Yes| F[Dashboard]
    B -->|Yes| F
    
    F --> G[Holdings Management]
    F --> H[Performance Page]
    F --> I[Settings Page]
    F --> J[Preview & Publish]
    
    G --> K[Add Holding]
    G --> L[Edit Holding]
    G --> M[Archive/Delete Holding]
    G --> N[Toggle Visibility]
    G --> O[Reorder Holdings]
    
    K --> P{Valid Form?}
    P -->|No| Q[Show Validation Errors]
    Q --> K
    P -->|Yes| R[Save & Return to List]
    
    L --> S{Valid Form?}
    S -->|No| T[Show Validation Errors]
    T --> L
    S -->|Yes| U[Save & Return to List]
    
    M --> V{Confirm Action?}
    V -->|No| G
    V -->|Yes| W[Execute & Return to List]
    
    J --> X[View Preview]
    X --> Y{Publish / Unpublish}
    Y -->|Publish| Z[Public Page Live]
    Y -->|Unpublish| AA[Public Page Returns 404]
    
    F --> AB[Refresh Market Data]
    AB --> AC{Rate Limit OK?}
    AC -->|Yes| AD[Fetch & Update]
    AC -->|No| AE[Show Rate Limit Warning]
```

## Public User Flow

```mermaid
flowchart TD
    A[Visit Public URL] --> B{Page Published?}
    B -->|No| C[404 Not Found]
    B -->|Yes| D[Load Portfolio Page]
    
    D --> E[Header / Hero Section]
    E --> F[Portfolio Overview]
    F --> G[Holdings Table]
    G --> H{More than 20 holdings?}
    H -->|Yes| I[Paginated / Show All Toggle]
    H -->|No| J[Display All]
    I --> K[Performance Section]
    J --> K
    K --> L[Select Date Range]
    L --> M[Portfolio vs S&P 500 Chart]
    M --> N[Methodology & Disclosure]
```
