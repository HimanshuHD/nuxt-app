# Application Architecture

> **Nuxt 4 application architecture**
>
> The application is organized around clear boundaries between routing, presentation, client-side behavior, API access, server integrations, domain types, and infrastructure. The goal is to keep features cohesive without introducing abstraction for abstraction's sake.

## Table of Contents

- [Architecture at a Glance](#architecture-at-a-glance)
- [Repository Structure](#repository-structure)
- [Request and Data Flow](#request-and-data-flow)
- [Layer Responsibilities](#layer-responsibilities)
- [Feature Boundaries](#feature-boundaries)
- [State Management](#state-management)
- [Routing and Code Splitting](#routing-and-code-splitting)
- [Styling and Assets](#styling-and-assets)
- [Server and Security Boundaries](#server-and-security-boundaries)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Development Conventions](#development-conventions)
- [Architectural Principles](#architectural-principles)

---

## Architecture at a Glance

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Nuxt Application                        │
├─────────────────────────────────────────────────────────────────┤
│  Routes / Pages                                                 │
│  app/pages                                                       │
│        │                                                        │
│        ▼                                                        │
│  UI Components ──────────────── Composables / Feature State     │
│  app/components                  app/composables                │
│        │                              │                         │
│        └──────────────┬───────────────┘                         │
│                       ▼                                         │
│                 Client Services                                │
│                 app/services                                    │
│                       │                                         │
│                       ▼                                         │
│                  Nuxt API Layer                                 │
│                  server/api                                     │
│                       │                                         │
│                       ▼                                         │
│                 Server Services                                 │
│                 server/services                                 │
│                       │                                         │
│                       ▼                                         │
│                 External APIs                                   │
│                 OpenWeatherMap                                  │
└─────────────────────────────────────────────────────────────────┘

                 Shared domain contracts
                       shared/types
                         ▲     ▲
                         │     │
                    Client   Server
```

The important rule is **one-way dependency flow**: presentation code should not reach through the layers and couple itself directly to external services.

---

## Repository Structure

```text
app/
├── components/
│   ├── ui/                  # Reusable UI primitives
│   ├── shared/              # Application-wide reusable components
│   └── <feature>/           # Feature-owned presentation components
├── composables/             # Reusable reactive client behavior
├── pages/                   # File-based route entry points
├── services/                # Client-side API/service boundary
├── types/                   # App-only TypeScript contracts
├── utils/                   # App-only pure helpers
├── assets/
│   ├── css/                 # Vite-processed global styles
│   └── images/              # Vite-processed application assets
└── app.vue                  # Application shell / global mounts

server/
├── api/                     # Thin HTTP/API handlers
├── services/                # External API and domain integrations
└── utils/                   # Focused server-side pure helpers

shared/
└── types/                   # Domain contracts shared by client/server

public/                      # Static files served as-is

modules/                     # Reserved for actual Nuxt modules

docs/                        # Project documentation
```

### Why these boundaries exist

| Area | Owns | Should avoid |
| --- | --- | --- |
| `app/pages` | Route-level orchestration | Large reusable logic or direct external API calls |
| `app/components` | Presentation and interaction | Owning application-wide data fetching |
| `app/composables` | Reactive behavior and feature state | Becoming a replacement for services |
| `app/services` | Client API boundary | Knowing external API credentials |
| `server/api` | HTTP request/response boundary | Becoming a large business-logic layer |
| `server/services` | External integrations and server operations | Exposing secrets to the client |
| `server/utils` | Focused pure server helpers | Mixing unrelated responsibilities |
| `shared/types` | Cross-boundary domain contracts | UI-specific implementation details |
| `app/assets` | Vite-processed assets/styles | Static files that need no processing |
| `public` | Static files served directly | Runtime application logic |

---

## Request and Data Flow

The weather feature is the reference implementation for the application's data flow.

```text
User interaction
      │
      ▼
┌───────────────┐
│ Weather Page  │  app/pages/weather.vue
└───────┬───────┘
        │
        ├──────────────► Components
        │
        └──────────────► Composables
                              │
                              ▼
                       Client Service
                       app/services/weather.ts
                              │
                              ▼
                        /api/weather
                        server/api/weather.get.ts
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Validation          Server Service
              server/utils        server/services
                                        │
                                        ▼
                                OpenWeatherMap
                                        │
                                        ▼
                              Response Normalizer
                              server/utils
                                        │
                                        ▼
                              Shared domain model
                              shared/types/weather.ts
                                        │
                                        ▼
                                  Weather UI
```

This keeps external API details out of components and pages. The same principle applies to geocoding and future server-backed features.

---

## Layer Responsibilities

### Pages

`app/pages` is the route-level orchestration layer. Nuxt's file-based routing is the source of truth for routes.

Pages should:

- coordinate feature state;
- compose components and composables;
- handle route-level concerns;
- remain readable and relatively thin.

Pages should not become the place where API calls, response normalization, reusable UI, and feature state are all implemented together.

### Components

`app/components` owns presentation and interaction.

- `components/ui` contains reusable primitives such as notifications and generic controls.
- `components/shared` contains application-level components reused across multiple domains.
- `components/<feature>` contains feature-specific components such as weather search and weather panels.

A component should generally receive data and emit user intent rather than knowing how an external API works.

### Composables

`app/composables` contains reusable reactive client-side behavior.

Examples include:

- debounced location search;
- persisted last-location behavior;
- feature-local state;
- browser capability and lifecycle handling.

Composables can coordinate services, but should not duplicate service-layer API implementations.

### Client Services

`app/services` is the client-side boundary around Nuxt server endpoints.

For example:

```text
useLocationSearch()
        │
        ▼
app/services/weather.ts
        │
        ▼
/api/geocode
```

This prevents `$fetch` calls from being scattered throughout components and pages.

### Server API

`server/api` contains thin Nuxt HTTP handlers.

An API handler should generally follow:

```text
request
  ↓
validate / parse HTTP input
  ↓
call server service
  ↓
return response
```

HTTP-specific concerns belong here. External API details and reusable server operations belong in `server/services`.

### Server Services

`server/services` owns integrations with external systems and server-side domain operations.

The OpenWeather integration is responsible for:

- reading private runtime configuration;
- calling OpenWeatherMap;
- translating upstream failures into application-level errors;
- delegating response normalization to focused utilities.

### Server Utilities

`server/utils` contains focused helpers with a single responsibility.

Current examples:

```text
coordinates.ts
    → coordinate parsing and validation

weather-normalizer.ts
    → OpenWeather response → application weather model
```

These utilities should not become a dumping ground for unrelated server behavior.

### Types

Use the narrowest appropriate scope:

```text
shared/types
    → contracts used by both client and server

app/types
    → client/app-only contracts
```

Domain models crossing the server/client boundary belong in `shared/types`.

---

## Feature Boundaries

Features should be cohesive. When a feature grows beyond a single component, keep its related presentation and behavior together where practical.

For example:

```text
app/components/weather/
├── LocationSearch.vue
├── WeatherPanel.vue
└── WeatherVisual.vue

app/composables/
├── useLocationSearch.ts
└── useLastLocation.ts

app/services/
└── weather.ts

shared/types/
├── location.ts
└── weather.ts
```

Shared/global directories should only contain code that is genuinely reused across domains.

**Rule:** prefer a small focused module over a new abstraction layer unless the abstraction solves a real duplication, ownership, or dependency problem.

---

## State Management

The application intentionally does not introduce a global store by default.

Use the smallest useful state boundary:

```text
Transient UI state
      ↓
component refs / reactive state

Feature state shared by components
      ↓
composable + useState

Cross-feature state with genuine global requirements
      ↓
dedicated store, only when justified
```

This avoids turning API responses, temporary UI state, or feature-specific state into unnecessary global state.

If a future store library is introduced, stores should be grouped by domain rather than creating one monolithic application store.

---

## Routing and Code Splitting

Nuxt file-based routing remains the source of truth:

```text
app/pages/index.vue   → /
app/pages/weather.vue → /weather
```

Nuxt provides route-level code splitting through the page architecture.

Heavy, non-critical feature components should use lazy loading only when there is a measurable benefit. Performance optimization is intentionally tracked separately in **#15** and is not mixed into this architecture refactor.

---

## Styling and Assets

### CSS

Global styles belong in:

```text
app/assets/css/
```

They are processed by Vite and registered through Nuxt configuration.

Component-specific styles should normally remain scoped to the component when that improves isolation.

### Assets

Use:

```text
app/assets/ → assets requiring Vite processing/imports
public/     → files that must be served as-is
```

Avoid placing global styles inside individual pages.

---

## Server and Security Boundaries

Secrets must never cross into browser code.

```text
Browser
  │
  │ public request
  ▼
Nuxt server API
  │
  │ private runtime config
  ▼
External service
```

For OpenWeatherMap:

- `NUXT_OPEN_WEATHER_API_KEY` is supplied through environment/Codespaces secrets;
- the key is read through Nuxt private runtime configuration;
- browser code calls our `/api/*` endpoints instead of OpenWeatherMap directly;
- the API key must never be committed to Git or exposed in client-side configuration.

The same boundary should be used for future integrations involving credentials.

---

## Testing

Tests should be concentrated around behavior that benefits from automated verification, especially:

- pure utility functions;
- API/service transformations;
- validation and error handling;
- composable state transitions;
- important feature behavior.

The repository uses Vitest for automated tests.

Before merging architecture changes, run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

---

## CI/CD

The repository intentionally uses two deployment workflows rather than a separate generic CI workflow that duplicates builds.

```text
feat/** push
     │
     ▼
feature-preview.yml
     │
     ▼
Shared feature-preview deployment

main push
     │
     ▼
deploy.yml
     │
     ▼
Protected GitHub Pages production deployment
```

### Feature Preview

`.github/workflows/feature-preview.yml`

- runs for feature branch pushes;
- provides a shared preview environment;
- cancels obsolete in-progress preview runs when a newer push arrives.

### Production

`.github/workflows/deploy.yml`

- runs for `main` pushes;
- performs the production deployment;
- uses the protected `github-pages` environment.

A separate generic `ci.yml` is intentionally not part of the current workflow because it would duplicate validation/build work already performed by the deployment pipelines.

---

## Development Conventions

### Keep source readable

- Do **not** minify existing source files.
- New files must use consistent indentation and spacing.
- Preserve readable formatting during refactors.

### Keep modules focused

- Prefer small modules with one clear responsibility.
- Avoid speculative abstractions.
- Keep page components thin.
- Keep API handlers thin.
- Keep external integrations in server services.

### Keep dependencies directional

```text
UI → composables/services → API → server services → external systems
```

Avoid reverse dependencies such as server code importing UI modules or components directly depending on external API implementation details.

### Keep secrets private

Never commit `.env` files containing credentials. Use local environment configuration or Codespaces/repository environment secrets as appropriate.

### Link work to issues

Commits should reference their related GitHub issue, for example:

```text
refactor(weather): split server utilities for #12
```

Pull requests should describe the architectural impact and include the relevant validation checklist.

---

## Architectural Principles

The architecture can be summarized by six principles:

```text
             ┌──────────────────────┐
             │  1. Clear Ownership  │
             └──────────┬───────────┘
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
 Thin Pages       Focused Services   Cohesive Features
      │                 │                 │
      └─────────────────┼─────────────────┘
                        ▼
             ┌──────────────────────┐
             │ 2. Directional Flow  │
             └──────────┬───────────┘
                        ▼
             UI → API → Services
                        │
                        ▼
             ┌──────────────────────┐
             │  3. Server Security  │
             └──────────┬───────────┘
                        ▼
                 Secrets stay
                  server-side

             ┌──────────────────────┐
             │ 4. Shared Contracts  │
             └──────────┬───────────┘
                        ▼
                  shared/types

             ┌──────────────────────┐
             │ 5. Minimal Abstraction│
             └──────────┬───────────┘
                        ▼
                Add layers only
                 when justified

             ┌──────────────────────┐
             │  6. Measurable Perf  │
             └──────────┬───────────┘
                        ▼
                  Optimize when
                   evidence says so
```

The architecture is intentionally designed to evolve. New features should fit these boundaries rather than creating a parallel architectural pattern.

---

## When Adding a New Feature

Use this decision path:

```text
New feature
    │
    ▼
Does it need a route?
    │
   yes ───────────────► app/pages
    │
    ▼
Does it need reusable UI?
    │
   yes ───────────────► app/components/<feature>
    │
    ▼
Does it need reactive/shared feature behavior?
    │
   yes ───────────────► app/composables
    │
    ▼
Does the browser need an API boundary?
    │
   yes ───────────────► app/services
    │
    ▼
Does the server need an endpoint?
    │
   yes ───────────────► server/api
    │
    ▼
Does it call an external service?
    │
   yes ───────────────► server/services
    │
    ▼
Is the logic a focused reusable helper?
    │
   yes ───────────────► app/utils or server/utils
    │
    ▼
Is the type shared across client/server?
    │
   yes ───────────────► shared/types
```

This keeps new work predictable and prevents feature code from leaking across architectural boundaries.
