import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Host-agnostic static build (see plan: "local first, decide later").
// To deploy under a sub-path later, set `base` and `site` here.
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
