# Application Architecture

This project uses a feature-oriented Nuxt structure with clear boundaries between routing, UI, state, data access, styles, and static assets.

## Responsibilities

- `app/pages/` — route entry points. Pages should stay thin and compose components/composables.
- `app/components/ui/` — reusable presentation primitives.
- `app/components/shared/` — reusable application-level components shared by multiple domains.
- `app/components/<feature>/` — feature-owned presentation components.
- `app/composables/` — reusable application logic and feature state. Keep domain state close to the feature that owns it.
- `app/types/` — shared TypeScript contracts.
- `app/utils/` — pure reusable helpers with no UI ownership.
- `app/assets/css/` — global styles processed by Vite. Component-specific styles may remain scoped to the component when that improves isolation.
- `public/` — static files that must be served without Vite processing.
- `server/api/` — Nuxt server endpoints for server-side integrations and secrets.
- `server/services/` — server-side API/service boundaries.
- `modules/` — reserved for true Nuxt modules that extend Nuxt itself; application features should not be placed here just for organization.

## Feature boundaries

Application features should own their components, composables, types, services, and state where that improves cohesion. Shared code belongs in the shared/global directories only when it is genuinely reused across domains.

The goal is modularity without creating unnecessary abstraction layers.

## Routing

Nuxt file-based routing is the source of truth. New routes should normally be represented by files under `app/pages/`. Use `NuxtLink` for internal navigation and layouts/middleware for cross-route concerns.

## State management

State should be owned by the smallest useful feature boundary. Prefer local component state for transient UI state and `useState` inside composables for shared feature state. Introduce a dedicated store library only when the application has cross-feature state that genuinely benefits from one.

## Data fetching

Pages should avoid embedding reusable API/state logic directly in templates. Extract reusable fetching and transformation into composables or services. Server-only credentials must stay in Nuxt server routes/runtime configuration and never be exposed to the browser.

## Styles and assets

Global/external CSS belongs under `app/assets/css/` and is registered through `nuxt.config.ts`. Static files that should not be processed by Vite belong under `public/`. Avoid putting global styles inside individual pages.

## Performance boundary

Route-level code splitting is provided by Nuxt's page architecture. Heavy, non-critical components should be introduced with lazy loading when there is a measurable benefit. Performance optimization is tracked separately and is intentionally not part of the current architecture refactor.

## CI/CD workflow

There are two deployment workflows:

- `.github/workflows/feature-preview.yml` — runs for `feat/**` pushes and publishes the shared feature-preview URL. In-progress previews are cancelled when a newer push arrives.
- `.github/workflows/deploy.yml` — runs only for `main` pushes and publishes production through the protected `github-pages` environment.

A separate generic CI workflow is intentionally not used; deployment workflows already perform the required build/type validation for this repository's current workflow.
