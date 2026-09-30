import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://overwatch-competitive-studies.qp2hw2rxsw.chatgpt.site',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: { rehypePlugins: [] },
});
