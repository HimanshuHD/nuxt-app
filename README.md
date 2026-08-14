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
