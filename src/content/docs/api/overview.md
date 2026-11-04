---
title: API overview
description: How to call the Baz API.
---

The API is `baz-api`, a Hono service. It publishes its own contract as an OpenAPI 3.1 document:

- Live document: [api.saoi.ie/api/openapi.json](https://api.saoi.ie/api/openapi.json)
- Rendered in these docs: [API reference](/api/reference/)

Details of the services are in [Services](/architecture/services/).

## Authentication

Everything under `/api` needs a Supabase access token:

```http
Authorization: Bearer <Supabase access token>
```

Get the token by signing in with Supabase Auth. A missing or invalid token returns 401. The audience
must be `authenticated`, so the anon key does not pass for a user.

The caller must be the primary participant of the case (a participant session joined to a
participant). For the case read routes, anything else is 404, not 403. The session, partner and
document routes follow the Edge Function they replace and return 403 for a case that is not yours.
Each route lists its own responses in the OpenAPI document.

`GET /health` and `GET /openapi.json` need no token. `GET /api/health` and `GET /api/openapi.json`
are aliases, so a proxy that forwards `/api/*` needs no rewrite.

## Routes

| Method and path                                                                | What                                                                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `GET /health`                                                                  | `{ ok: true, version }`                                                                          |
| `GET /openapi.json`                                                            | The OpenAPI 3.1 document                                                                         |
| `GET /api/cases/:caseId/snapshot`                                              | Applications, plans, requests, answers, linked accounts, transfers, notifications and `signedIn` |
| `GET /api/cases/:caseId/history`                                               | The conversation as the screen renders it                                                        |
| `GET /api/cases/:caseId/events`                                                | Server-Sent Events change feed                                                                   |
| `POST /api/sessions`                                                           | Attach this browser to its case, starting one if it has none                                     |
| `GET /api/cases`, `POST /api/cases`                                            | List the conversations this browser can open; begin a new one                                    |
| `POST /api/cases/:caseId/switch`                                               | Move onto another conversation                                                                   |
| `POST /api/cases/:caseId/documents`                                            | Multipart upload; the type is read from the bytes                                                |
| `POST /api/cases/:caseId/products/select`                                      | Choose products                                                                                  |
| `POST /api/cases/:caseId/applications/:applicationId/...`                      | `confirm`, `submit`, `pause`, `resume`, `consent` and more                                       |
| `POST /api/cases/:caseId/plans/:planId/decisions`                              | Decide a plan                                                                                    |
| `POST /api/cases/:caseId/invites`                                              | Invite a partner; 201 with `inviteUrl`                                                           |
| `POST /api/partner/join`, `GET /api/partner/tasks`, `POST /api/partner/submit` | The partner's side                                                                               |

The full list, with schemas, is in the [API reference](/api/reference/). There is also an admin API
under `/api/admin/*`, guarded separately.

## Errors

Errors use one envelope:

```json
{ "ok": false, "error": { "code": "internal", "message": "safe message", "requestId": "..." } }
```

`details` is optional. Anything unexpected becomes `internal` with a generic message; the real
cause goes to the server log under the same `requestId`.

## Server-Sent Events

`GET /api/cases/:caseId/events` is the change feed:

- `ready` on open.
- `update` for each narratable event.
- A `: keep-alive` comment every 25 seconds.
- Resume with the `Last-Event-ID` header.

Use `fetch` and read the stream. Do not use `EventSource`, which cannot send the `Authorization`
header. The stream is polled from the database every 2 seconds per open stream.

Conversation turns (the model's replies) also stream over SSE. The turn contract is a Zod
discriminated union of `text_delta`, `retract`, `card`, `status`, `done` and `error`.

:::caution[To be written]
The turn endpoint on `baz-api` is not documented here yet. The turn logic is still being ported
from the Edge Function.
:::

## Rate limit

`/api/*` is limited per user. The default is 120 requests per minute.
