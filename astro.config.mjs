import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [tailwind(), sitemap()],
  site: 'https://freestuff-dartmouth.vercel.app',
  devToolbar: {
    enabled: false
  },
  // Note: Astro 5+ uses static output by default with hybrid behavior built-in
});
