---
title: Contributing
description: How to report a problem, send a change, and what the licences are.
---

## Issues

Open an issue on the repository the problem is in:

- Product and services: [chris-88/saoi](https://github.com/chris-88/saoi/issues)
- These docs: [chris-88/saoi-docs](https://github.com/chris-88/saoi-docs/issues)

Say what you did, what you expected and what happened. For the API, include the `requestId` from the
error envelope.

## Pull requests

1. Fork the repository and branch. The product repo's active work is on `next`; check before you
   start.
2. Use Node 24 and npm.
3. Run the repository's gate before you push. In the product repo that is `npm run check`: typecheck,
   lint, format check, seed check, test, build and bundle scan. In this repo, `npm run check`.
4. Keep commits conventional and imperative, one concern per commit.
5. Open the pull request and say what changed and why.

:::caution[To be written]
The product repository has no written Definition of Done yet, only the `npm run check` gate. A
checklist for contributors will go here when it exists.
:::

Never commit secrets. The browser gets the anon key only, never the service role key.

## Licences

| What                      | Licence                                                     |
| ------------------------- | ----------------------------------------------------------- |
| Code                      | [AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.html) |
| Documentation (this site) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)   |

Copyright 2026 Chris Quinn.
