import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stat = z.object({ value: z.string(), label: z.string() });
const image = z.object({ src: z.string(), alt: z.string() });

/**
 * One Markdown file per project in src/content/projects/.
 * The front matter (between the --- lines) holds the structured story;
 * anything written below it becomes extra long-form text on the case-study page.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
    accent: z.enum(['sky', 'aqua', 'shore', 'dusk']).default('sky'),
    date: z.string(),
    tag: z.string(),
    intro: z.string(),
    /** One friendly paragraph: background, problem, how it was solved, and the result. */
    description: z.string().optional(),
    /**
     * Optional documentation slides. An image: { src: "/images/projects/<project>/1.webp", alt, caption }.
     * A screen recording: { video: "/images/projects/<project>/demo.mp4", poster: "/images/projects/<project>/demo.webp", alt, caption }.
     */
    slides: z
      .array(
        z.object({
          src: z.string().optional(),
          video: z.string().optional(),
          poster: z.string().optional(),
          alt: z.string().default(''),
          caption: z.string().default(''),
          /** Photos only: fill the box and crop to this focus point, e.g. "50% 70%" (x y; higher y shows more of the bottom). Leave out to show the whole photo. */
          position: z.string().optional(),
        })
      )
      .default([]),
    /** Cap the carousel at this many slides (no text filler slides beyond your own documentation). Default 3. */
    maxSlides: z.number().int().min(1).max(3).default(3),
    oneLiner: z.string().optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    keyResult: stat.optional(),
    tldr: z
      .object({ problem: z.string(), approach: z.string(), result: z.string() })
      .optional(),
    background: z.string().optional(),
    problem: z.string().optional(),
    objective: z.string().optional(),
    data: z.object({ summary: z.string(), stat: stat.optional() }).optional(),
    approach: z.string().optional(),
    method: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    results: z
      .object({
        summary: z.string(),
        metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      })
      .optional(),
    contribution: z.string().optional(),
    insights: z.string().optional(),
    images: z
      .object({
        context: image.optional(),
        data: image.optional(),
        approach: image.optional(),
        results: image.optional(),
      })
      .default({}),
    links: z
      .object({
        paper: z.string().default(''),
        github: z.string().default(''),
        demo: z.string().default(''),
        report: z.string().default(''),
      })
      .default({}),
  }),
});

export const collections = { projects };
