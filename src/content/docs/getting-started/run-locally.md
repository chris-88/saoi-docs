---
title: Run it locally
description: Clone the Saoirse repository, point it at a Supabase project and start the app.
---

The product repository is
[chris-88/baz-conversational-banking](https://github.com/chris-88/baz-conversational-banking).

:::note
The commands below come from the README on the `next` branch, where the work is happening. The
default branch may differ.
:::

## Requirements

- Node 24 (the repo has an `.nvmrc`; use [nvm](https://github.com/nvm-sh/nvm)) and npm.
- A Supabase project: local (`supabase start`, which needs Docker and the
  [Supabase CLI](https://supabase.com/docs/guides/cli), pinned at 2.108.0 in CI), hosted or
  self-hosted.
- [Deno](https://deno.com) 2.x, only for `npm run typecheck:functions`.
- An Anthropic API key, only to run Saoirse against a real model. Without one, use the fixture provider
  (below).

## Setup

```sh
git clone https://github.com/chris-88/baz-conversational-banking.git
cd baz-conversational-banking
nvm use
npm ci
cp .env.example .env
cp supabase/.env.local.example supabase/.env.local
npx supabase start          # or point .env at a hosted or self-hosted project
npx supabase functions serve --env-file supabase/.env.local
npm run dev
```

## Environment variables

Names only. Copy the `.example` files and fill in values. Never commit them.

| File                                   | Variables                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env` (browser build)                 | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`, `VITE_BASE_PATH`, `VITE_BAZ_API_URL`, `VITE_VAPID_PUBLIC_KEY`                                                              |
| `supabase/.env.local` (Edge Functions) | `ANTHROPIC_API_KEY`, `BAZ_MODEL`, `GATE_MODEL`, `APP_BASE_URL`, `AUDIENCE_MAX_CASES`, `PRESENTER_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_D`, `VAPID_SUBJECT`, `LLM_PROVIDER`, `LLM_FIXTURE` |
| `services/api/.env`                    | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`, `PORT`                                                                                                   |

The browser gets the anon key only. The service role key and the Anthropic key never reach a
browser.

To run with no model key and no bill, set `LLM_PROVIDER=fixture` and point `LLM_FIXTURE` at a script
in `supabase/functions/baz-turn/fixtures/`.

## Commands

| Command                               | What it does                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run check`                       | The pre-merge gate: typecheck, lint, format check, seed check, test, build, bundle scan |
| `npm run dev`                         | Vite dev server                                                                         |
| `npm run build`                       | Typecheck and production build                                                          |
| `npm run preview`                     | Serve the production build                                                              |
| `npm run typecheck`                   | `tsc -b`                                                                                |
| `npm run typecheck:functions`         | `deno check` the Edge Functions                                                         |
| `npm run lint`                        | ESLint                                                                                  |
| `npm run format`, `format:check`      | Prettier write or check                                                                 |
| `npm test`, `test:watch`              | Vitest                                                                                  |
| `npm run e2e`                         | Playwright route and render checks                                                      |
| `npm run seed:generate`, `seed:check` | Regenerate or verify `supabase/seed.sql`                                                |
| `npm run check:bundle`                | Scan `dist/` for secrets                                                                |
| `npm run eval:guardrails`             | Live gate against the adversarial set (needs `.env`)                                    |
| `npm run compare:models`              | Compare models on recorded turns (needs `.env`)                                         |
| `npm run db:types`                    | Regenerate Supabase types from the linked project                                       |
| `npm run email:push`                  | Push auth email templates to the hosted project                                         |

## Repository layout

```text
src/                  the SPA (React, Vite, Tailwind, shadcn/ui)
supabase/migrations/  Postgres schema and RLS
supabase/functions/   Edge Functions (Deno) and _shared (domain, contracts, llm, tenants)
services/api/         baz-api, a Node service
scripts/  e2e/  evals/  tests/
docs/                 long-form documentation
CLAUDE.md             operational summary for contributors and coding agents
```

## Run baz-api

`baz-api` is a Hono service (Node 24, its own `package.json` and lockfile) that is taking over the
case read API from the browser and, over time, the Edge Functions. See
[Services](/architecture/services/).

```sh
cd services/api
npm ci
cp .env.example .env   # or export the variables
npm run dev            # tsx watch, port 3000
npm run typecheck && npm run lint && npm test
npm run test:integration   # needs `supabase start` at the repo root
npm run build && npm start
```

`baz-api` environment:

| Variable                    | Required | Meaning                                                                                                |
| --------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `SUPABASE_URL`              | yes      | The Supabase gateway as seen from the service.                                                         |
| `SUPABASE_SERVICE_ROLE_KEY` | yes      | Server-side data access. Never logged, never sent to a browser.                                        |
| `SUPABASE_JWT_SECRET`       | one of   | HS256 secret of the project (self-hosted default).                                                     |
| `SUPABASE_JWKS_URL`         | one of   | Defaults to `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`; used for asymmetric tokens.               |
| `SUPABASE_JWT_ISSUER`       | no       | Required `iss` claim. Unset, not checked.                                                              |
| `CORS_ORIGINS`              | no       | Comma-separated allowed origins. Default empty: every origin denied; `*` is ignored.                   |
| `RATE_LIMIT_MAX`            | no       | Requests per user per window on `/api/*`, default 120. In memory, per process.                         |
| `RATE_LIMIT_WINDOW_MS`      | no       | Window length, default 60000.                                                                          |
| `PRESENTER_KEY`             | no       | Opens the case switcher to every case for a device sending it as `X-Presenter-Key`. Unset, nobody can. |
| `AUDIENCE_MAX_CASES`        | no       | Customer cases a day before a new one is refused, default 50.                                          |
| `APP_BASE_URL`              | no       | Where the SPA is served; the partner invite link is `${APP_BASE_URL}/#/join/<token>`.                  |
| `PORT`                      | no       | Default 3000.                                                                                          |
| `APP_VERSION`               | no       | Reported by `/health`.                                                                                 |

The service fails to start on a missing or malformed variable and names it, never its value.

## Docker

The image bundles code from outside the package, so the build context is the repository root:

```sh
docker build -f services/api/Dockerfile -t baz-api --build-arg APP_VERSION=$(git rev-parse --short HEAD) .
```

Node 24 alpine, multi-stage, runs as `node`, with a `HEALTHCHECK` on `/health`. Behind a proxy,
stream endpoints must not be buffered, and the service sends a keep-alive every 25 seconds so
intermediaries do not cut idle connections.

## Licence

The product is AGPL-3.0-only. See [Contributing](/contributing/).
