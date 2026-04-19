---
title: "System Architecture"
type: architecture
created: 2026-04-14
updated: 2026-04-14
tags: [architecture, system, phase-3]
sources: [raw/prompt.md]
related: [information-architecture, data-storage-schema, api-routes, frontend, backend]
status: final
phase: 3
lead: Agent 3 (Solution Architect)
---

# System Architecture

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Users
        Admin[Admin User]
        Public[Public Visitor]
    end

    subgraph Frontend["Frontend (React SPA)"]
        AdminUI[Admin Portal]
        PublicUI[Public Page]
    end

    subgraph Backend["Backend (Node.js / Express)"]
        AuthMW[Auth Middleware]
        AdminAPI[Admin API Routes]
        PublicAPI[Public API Routes]
        AVService[Alpha Vantage Service]
        DataService[Data Service]
        CacheService[Cache Service]
        CalcEngine[Calculation Engine]
    end

    subgraph DataLayer["File-Based Data (data/)"]
        Holdings[data/holdings/]
        Settings[data/settings.json]
        Cache[data/cache/]
        Benchmark[data/benchmark/]
        Audit[data/audit/]
    end

    subgraph External
        AV[Alpha Vantage API]
    end

    Admin -->|Authenticated| AdminUI
    Public -->|Read-only| PublicUI
    AdminUI -->|API Calls| AuthMW
    AuthMW -->|Authorized| AdminAPI
    PublicUI -->|API Calls| PublicAPI

    AdminAPI --> DataService
    AdminAPI --> AVService
    AdminAPI --> CalcEngine
    PublicAPI --> DataService
    PublicAPI --> CalcEngine

    DataService --> Holdings
    DataService --> Settings
    DataService --> Audit

    AVService --> CacheService
    CacheService --> Cache
    CacheService --> Benchmark
    AVService -->|Rate-limited| AV

    CalcEngine --> DataService
    CalcEngine --> CacheService
```

## High-Level Design

The application follows a **client-server architecture** with a React SPA frontend and a Node.js/Express backend. Data is persisted as JSON files in a `data/` directory. Market data is fetched from Alpha Vantage and cached locally.

### Layers

1. **Frontend (React)**: SPA with client-side routing. Admin portal and public page share the same build but have separate route trees. The admin routes are protected by authentication.

2. **Backend (Express)**: RESTful API server that handles data operations, Alpha Vantage integration, and return calculations. All API keys are server-side only.

3. **Data Layer (File System)**: JSON files in `data/` directory. No database server. Git provides version history.

4. **External (Alpha Vantage)**: Third-party API for market data. Accessed server-side only through the cache service.

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express as Express Server
    participant Auth as Auth Middleware
    participant DataSvc as Data Service
    participant CacheSvc as Cache Service
    participant AV as Alpha Vantage

    Client->>Express: HTTP Request
    Express->>Auth: Check auth (admin routes only)
    Auth-->>Express: Authorized / 401
    Express->>DataSvc: Read/Write data files
    DataSvc-->>Express: Data
    
    alt Market Data Needed
        Express->>CacheSvc: Check cache
        alt Cache Hit
            CacheSvc-->>Express: Cached data
        else Cache Miss
            CacheSvc->>AV: API Request
            AV-->>CacheSvc: Response
            CacheSvc-->>Express: Fresh data
        end
    end
    
    Express-->>Client: JSON Response
```

## Deployment Architecture

- **Development**: `npm run dev` starts both frontend (Vite dev server) and backend (Express) concurrently
- **Production build**: Frontend compiles to static files, served by Express
- **Hosting**: Any Node.js hosting (e.g., Railway, Render, Fly.io, or self-hosted)
- **CI/CD**: GitHub Actions — lint, test, build, deploy
- **Environment**: `.env` file for API keys and secrets (never committed)
