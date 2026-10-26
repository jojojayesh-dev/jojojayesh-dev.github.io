import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One JSON per project, written by scripts/sync-projects.mjs
const projects = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string(),
      subtitle: z.string(),
      year: z.number(),
      course: z.string(),
      role: z.string(),
      tags: z.array(z.string()),
      order: z.number(),
      cover: image(),
      dashboard: z.string().url().optional(),
      sections: z.array(z.object({
        type: z.string(),
        items: z.array(z.object({ src: image(), alt: z.string(), zone: z.string(), place: z.string() })).optional(),
      })),
      text: z.object({
        lede: z.string(),
        sections: z.array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) })),
      }).optional(),
      site: z.object({ label: z.string(), latitude: z.number(), longitude: z.number(), area_sqm: z.number(), elevation_m: z.number() }),
      climate: z.record(z.string(), z.string()).optional(),
      files: z.array(z.string()),
    }),
});

export const collections = { projects };
