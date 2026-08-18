# First Nuxt App

A Nuxt application built with Vue and Vite and deployed to GitHub Pages using GitHub Actions.

## Stack

- Nuxt
- Vue
- Vite
- TypeScript
- ESLint
- Vitest
- GitHub Actions
- GitHub Pages

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run generate
```

## Architecture

The application uses a feature-oriented structure with separate responsibilities for pages, components, composables, client services, server API routes, and server integrations.

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

See [`docs/architecture.md`](docs/architecture.md) for the ownership and state-management conventions.

## Environment configuration

OpenWeatherMap configuration is kept in Nuxt private runtime configuration. Do not commit `.env` files or API keys.

Expected environment variables:

```text
NUXT_OPEN_WEATHER_API_KEY
NUXT_OPEN_WEATHER_BASE_URL
```

For GitHub Codespaces and GitHub Actions, configure these values as environment secrets rather than storing them in the repository.

## Deployment

The `main` branch is the production branch.

Every push to `main` runs the GitHub Pages deployment workflow:

1. Install dependencies
2. Prepare Nuxt
3. Generate the static site
4. Upload `.output/public` as a Pages artifact
5. Deploy the artifact to GitHub Pages

The application is configured for:

`https://himanshuhd.github.io/nuxt-app/`

## Branching

Use feature branches and pull requests for application changes:

```text
feature/* → pull request → main → GitHub Pages
```
