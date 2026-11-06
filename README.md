# saoi-docs

Documentation for Saoi and Saoirse, built with [Astro Starlight](https://starlight.astro.build). Live at
<https://docs.saoi.ie>.

Saoi (Irish for a sage, said "see") is the product. Saoirse is the assistant. It is a proof of concept on
synthetic Demo Bank data.

## Develop

```sh
nvm use        # Node 24
npm install
npm run dev
npm run check  # astro check, eslint, prettier, build
```

The API reference page is rendered at build time from the live OpenAPI document, so a build needs
network access.

## Layout

Pages are Markdown in `src/content/docs/`. The sidebar is in `astro.config.mjs`. The accent colour
is the Demo Bank teal, set in `src/styles/theme.css`. Pushing to `main` deploys to GitHub Pages.

## Licence

- Documentation content: [CC BY 4.0](LICENSE-DOCS)
- Code (config, components, workflow): [AGPL-3.0-only](LICENSE)

Copyright 2026 Chris Quinn.
