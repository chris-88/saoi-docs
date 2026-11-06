---
title: Services
description: The layout of saoi-api and how to add a route.
---

`saoi-api` is the business-logic service for Saoirse: Node 24, TypeScript, [Hono](https://hono.dev) with
`@hono/zod-openapi`. It lives in `services/api/` of the product repository. It serves the case read
API, so the app stops reading tables from the browser, and it carries ports of the `session`,
`partner` and `upload` Edge Functions. The Edge Functions stay until cutover. The app picks one or
the other with `VITE_SAOI_API_URL`.

For the endpoint list, see the [API overview](/api/overview/) and the
[API reference](/api/reference/).

## Layout

```text
src/
  app.ts                 createApp(deps): middleware order, routers, OpenAPI doc, error handler
  server.ts              loads env, wires the real deps, listens
  context.ts             AppEnv: what middleware puts on the Hono context
  env.ts  errors.ts  log.ts
  middleware/            requestId, accessLog, auth, rateLimit, requireCaseAccess,
                         requireIdentity (session routes), requirePartner
  routes/
    common.ts            ErrorResponse and the shared response entries
    health.ts
    cases/               one file per resource, its Zod schemas beside it; index.ts composes them
    session/ partner/ documents/   the ported Edge Functions
  store/                 typed data access, no Hono imports (cases, sessions, partners, uploads, client)
  testing.ts             in-memory fake stores and token helper for tests
test/integration/        specs against `supabase start` (harness.ts, one spec per resource)
```

The shared server code (`contracts`, `domain`, `db/database.types` under
`supabase/functions/_shared`) is imported through the `@shared/*` alias, not copied. The package
keeps its own `node_modules`, so there is a single zod instance. The build bundles our code and
leaves packages external.

## Who may take a case action

`requireCaseSeat` admits any seat on the case (a stranger gets 404). Then each route's
`requireRole('<action>')` checks `src/routes/cases/policy.ts`, the one table of action to roles.
Today every action is primary only; a partner or an administrator gets 403. The Edge Function never
read the role, so a partner could take all sixteen actions. The read routes keep `requireCaseAccess`
(primary only).

Transactions: `submit_application_tx` and `invite_partner_tx` are Postgres functions called with
`rpc`, because supabase-js cannot hold a transaction.

## Add a route

1. Add `src/store/<area>.ts` if you need data: a typed interface plus the Supabase implementation.
   Add it to `AppDeps` and the context in `app.ts`, and a fake in `testing.ts`.
2. Add `src/routes/<area>/<resource>.ts`: Zod schemas (name every response with
   `.openapi('Name')`), `createRoute`, and `new OpenAPIHono<AppEnv>().openapi(route, handler)`.
   Copy `routes/cases/snapshot.ts`.
3. Spread `authenticatedErrors` and add the 4xx you can return to `responses`. Do not return errors:
   throw `new ApiError(code, 'safe message')`.
4. Per-resource guards go in `routes/<area>/index.ts` with `.use(path, middleware)`, as
   `requireCaseAccess` does for `/api/cases/:caseId/*`. Read what it loaded with
   `c.get('caseAccess')`.
5. Compose the area's router in `app.ts` with `app.route('/', ...)`. Everything under `/api/*`
   already has auth and the rate limit.
6. Test with `createApp({ store: fakeStore(), ... })` and `app.request(...)`. Extend the component
   list in `app.shape.test.ts`.

## Errors and logs

Errors are `{ ok: false, error: { code, message, details?, requestId } }`. Anything that is not an
`ApiError` becomes `internal` with a generic message; the real one goes to the log with the request
id. Logs are JSON lines, and keys that look like credentials are redacted.
