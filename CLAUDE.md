# CLAUDE.md

## What this is

`saoi-docs` is the documentation site for Saoi (the product) and Saoirse (the assistant), at
`https://docs.saoi.ie`. Astro with Starlight, static output, deployed to GitHub Pages on push to
`main`. Content is Markdown in `src/content/docs/`.

## Stack

| Concern  | Choice                                                               |
| -------- | -------------------------------------------------------------------- |
| Build    | Astro + Starlight, static, Node 24 (`.nvmrc`)                        |
| Diagrams | `astro-mermaid` (client-side)                                        |
| API ref  | `starlight-openapi`, fetched at build from the live OpenAPI document |
| Hosting  | GitHub Pages via Actions, `public/CNAME` = `docs.saoi.ie`            |
| Licence  | Code AGPL-3.0-only (`LICENSE`), content CC BY 4.0 (`LICENSE-DOCS`)   |

## Definition of Done

- [ ] `npm run check` passes (astro check, eslint, prettier, build).
- [ ] Facts come from the source repos or the vault. Where a fact is missing, write a "To be written" note, do not invent.
- [ ] Voice: direct, plain, no em dashes, no marketing words.
- [ ] Public-safe: no machine names, secret paths, internal file paths, or employer names.
- [ ] Commit follows Conventional Commits and the diff is focused.

## Notes

- The OpenAPI schema URL in `astro.config.mjs` is `https://api.saoi.ie/api/openapi.json`.
- Sources: product repo `chris-88/saoi` (branch `main`), `saoi-mcp`, and the product notes in the vault.
- Rolling deploy: commit, push to `main`, watch the Pages deploy.
