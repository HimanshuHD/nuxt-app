# Application Architecture

## Overview

This application follows a feature-oriented Nuxt structure with a clear separation between route pages, UI components, composables, client services, and server services.

```text
app/
├── components/
│   ├── ui/
│   └── weather/
├── composables/
├── pages/
├── services/
├── types/
├── utils/
└── assets/

server/
├── api/
├── services/
└── utils/

shared/
└── types/
```

## Responsibilities

### Pages

Files under `app/pages` own route-level orchestration. They coordinate feature state and compose reusable components, but should avoid embedding reusable API or presentation logic.

### Components

Components under `app/components` own presentation and interaction concerns. Feature-specific components live under a feature directory such as `components/weather`; reusable primitives belong under `components/ui`.

### Composables

Composables contain reusable reactive client-side behavior, such as debounced location search and local persistence. They should not become a replacement for domain services.

### Client services

`app/services` provides a small client-side API boundary around Nuxt server endpoints. Components and pages should use these functions instead of scattering `$fetch` calls throughout feature code.

### Server API

`server/api` contains thin HTTP handlers. Validation and HTTP-specific concerns belong here, while upstream integrations and domain operations belong in `server/services`.

### Server services

`server/services` contains integrations with external systems such as OpenWeatherMap. Secrets are accessed only through Nuxt private runtime configuration and are never exposed to client code.

### Types

Shared domain types live under `shared/types` when they are used by both client and server code. App-only types can live under `app/types` when they do not cross the client/server boundary.

### Utilities

Utilities contain focused, side-effect-free helpers such as response normalization and coordinate validation.

## State management

The application currently uses feature-local reactive state through composables and page-level refs. A global store is intentionally not introduced until a feature requires shared cross-route state. This avoids turning server/API state or transient UI state into unnecessary global state.

If future features need shared state, stores should be grouped by domain rather than using one global application store.

## Routing and code splitting

Nuxt file-based routing remains the source of truth for application routes. Pages are route boundaries and Nuxt/Vite provide route-level code splitting automatically. Heavy feature components should only be dynamically loaded when there is measurable benefit.

Performance-specific optimizations are tracked separately in issue #15 and are intentionally not mixed into the initial architecture refactor.

## Styling and assets

Global styles belong in `app/assets/css`. Component-specific styles should remain scoped to their component. Assets that require Vite processing belong in `app/assets`; files that should be served as-is belong in `public`.

## Development conventions

- Keep existing files readable; do not minify source files.
- New files must use consistent indentation and spacing.
- Prefer small, focused modules over large abstractions.
- Keep API handlers thin.
- Keep secrets server-side.
- Add tests for reusable logic and important state transitions.
- Reference the related GitHub issue in commits.
