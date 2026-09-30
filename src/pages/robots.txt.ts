import type { APIRoute } from 'astro';
import { sitePath } from '../lib/lessons';
export const GET: APIRoute = ({ site }) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(sitePath('/sitemap-index.xml'), site)}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
