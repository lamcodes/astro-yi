import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

import { normalizeUtc8DateInput } from './utils/content-entry'

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    date: z.preprocess(normalizeUtc8DateInput, z.date()),
    tags: z.array(z.string()).or(z.string()).optional().nullable(),
    category: z.array(z.string()).or(z.string()).default('uncategorized').nullable(),
    sticky: z.number().default(0).nullable(),
    mathjax: z.boolean().default(false).nullable(),
    mermaid: z.boolean().default(false).nullable(),
    draft: z.boolean().default(false).nullable(),
    toc: z.boolean().default(true).nullable(),
    donate: z.boolean().default(true).nullable(),
    comment: z.boolean().default(true).nullable(),
  }),
})

const feed = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/feed',
  }),
  schema: z.object({
    date: z.preprocess(normalizeUtc8DateInput, z.date()).optional().nullable(),
    donate: z.boolean().default(true),
    comment: z.boolean().default(true),
  }),
})

export const collections = { blog, feed }
