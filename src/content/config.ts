import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    date: z.preprocess((arg) => {
      if (typeof arg === 'string') {
        // 附加时区偏移以将日期字符串视为UTC+8
        return `${arg}+08:00`;
      }
      return arg;
    }, z.date()),
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
});

const feed = defineCollection({
  schema: z.object({
    date: z.preprocess((arg) => {
      if (typeof arg === 'string') {
        return `${arg}+08:00`;
      }
      return arg;
    }, z.date()).optional().nullable(),
    donate: z.boolean().default(true),
    comment: z.boolean().default(true),
  })
})

export const collections = { blog, feed };
