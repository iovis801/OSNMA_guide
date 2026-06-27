import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Deployed under a sub-path on the main site: https://iovis.space/osnma
// `site` + `base` drive canonical URLs, the sitemap and base-prefixed assets.
export default defineConfig({
  site: 'https://iovis.space',
  base: '/osnma',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
