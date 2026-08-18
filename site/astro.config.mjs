import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// NetLens static site — builds to site/dist/
// Deploy: copy dist/* to the gh-pages branch root (GitHub Pages custom domain).
export default defineConfig({
  site: 'https://netlens.rezwan.bro.bd',
  integrations: [mdx()],
  build: {
    // Emit docs/librenms-integration.html (not a folder) — matches the old URL.
    format: 'file',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },
});
