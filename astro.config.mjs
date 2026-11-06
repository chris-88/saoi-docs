// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://docs.saoi.ie',
  output: 'static',
  integrations: [
    // Must come before starlight so it can handle ```mermaid blocks.
    mermaid({ autoTheme: true }),
    starlight({
      title: 'Saoi docs',
      favicon: '/favicon.svg',
      logo: {
        light: './src/assets/saoi-name-light.svg',
        dark: './src/assets/saoi-name-dark.svg',
        alt: 'Saoi docs',
        replacesTitle: true,
      },
      description:
        'Documentation for Saoi and Saoirse, a proof of concept in conversational banking.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/chris-88/saoi-docs' }],
      editLink: { baseUrl: 'https://github.com/chris-88/saoi-docs/edit/main/' },
      customCss: ['./src/styles/theme.css'],
      components: { Footer: './src/components/Footer.astro' },
      plugins: [
        starlightOpenAPI([
          {
            base: 'api/reference',
            label: 'API reference',
            schema: 'https://api.saoi.ie/api/openapi.json',
          },
        ]),
      ],
      sidebar: [
        { label: 'Overview', slug: '' },
        {
          label: 'Getting started',
          items: [{ slug: 'getting-started/run-locally' }],
        },
        {
          label: 'Architecture',
          items: [{ slug: 'architecture/overview' }, { slug: 'architecture/services' }],
        },
        {
          label: 'API',
          items: [{ slug: 'api/overview' }, ...openAPISidebarGroups],
        },
        { label: 'MCP', items: [{ slug: 'mcp/using-saoirse-from-an-agent' }] },
        { label: 'Open banking', items: [{ slug: 'open-banking/roadmap' }] },
        { slug: 'showcase' },
        { slug: 'contributing' },
      ],
    }),
  ],
});
