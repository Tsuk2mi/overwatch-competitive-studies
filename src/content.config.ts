import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/lessons' }),
  schema: z.object({
    title: z.string(),
    lesson: z.number().int().positive(),
    slug: z.string().regex(/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.enum(['published', 'coming-soon']),
    contentState: z.enum(['approved', 'draft', 'awaiting-source']),
    description: z.string().max(180),
    englishTitle: z.string(),
    shortTitle: z.string().optional(),
    supplement: z.object({ title: z.string(), anchor: z.string().regex(/^[a-z0-9-]+$/) }).optional(),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    readingTime: z.number().int().nonnegative(),
    concepts: z.array(z.string()).default([]),
    notice: z.string().optional(),
    source: z.string(),
  }).refine(d => d.status !== 'published' || d.contentState === 'approved', {
    message: 'Only approved course text may be published.',
  }),
});

export const collections = { lessons };
