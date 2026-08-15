# Application Architecture

This project uses a feature-oriented Nuxt structure with clear boundaries between routing, UI, state, data access, styles, and static assets.

## Responsibilities

- `app/pages/` — route entry points. Pages compose feature/shared components and should stay thin.
- `app/components/ui/` — reusable presentation primitives.
- `app/components/` — shared application components that are not domain-specific.
- `app/composables/` — reusable client/application logic and feature state. Prefer composables with `useState` for small feature-scoped state instead of a monolithic global store.
- `app/types/` — shared TypeScript contracts.
- `app/utils/` — pure reusable helpers.
- `app/assets/css/` — global styles processed by Vite.
- `public/` — static files that must be served without Vite processing.
- `server/api/` — Nuxt server endpoints for server-side integrations and secrets.
- `server/services/` — server-side API/service boundaries.
- `modules/` — reserved for true Nuxt modules that extend Nuxt itself; application features should not be placed here just for organization.

## Routing

Nuxt file-based routing is the source of truth. New routes should normally be represented by files under `app/pages/`. Use `NuxtLink` for internal navigation and layouts/middleware for cross-route concerns.

## State management

State should be owned by the smallest useful feature boundary. Prefer local component state for transient UI state and `useState` inside composables for shared feature state. Introduce a dedicated store library only when the application has cross-feature state that genuinely benefits from one.

## Data fetching

Pages should avoid embedding reusable API/state logic directly in templates. Extract reusable fetching and transformation into composables or services. Server-only credentials must stay in Nuxt server routes/runtime configuration and never be exposed to the browser.

## Performance boundary

Route-level code splitting is provided by Nuxt's page architecture. Heavy, non-critical components should be introduced with lazy loading when there is a measurable benefit. Performance optimization is tracked separately and is intentionally not part of the current architecture refactor.

## Feature workflow

Feature work is developed on `feat/*` branches, validated through the stable feature preview URL, and promoted through a PR into `main`. Architecture changes should not be mixed with unrelated product features.
