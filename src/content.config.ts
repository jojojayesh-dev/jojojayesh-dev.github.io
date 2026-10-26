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
      cover_alt: z.string(),
      cover_ai: z.boolean().default(false),
      sections: z.array(z.object({
        type: z.enum(["hero", "text", "climate", "sunpath", "compare", "images", "gallery", "model", "drawings", "link"]),
        heading: z.string().optional(),
        link: z.string().optional(),
        items: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional(), ai: z.boolean().default(false), zone: z.string().optional(), place: z.string().optional() })).optional(),
        before: z.object({ src: image(), alt: z.string(), label: z.string(), ai: z.boolean().default(false) }).optional(),
        after: z.object({ src: image(), alt: z.string(), label: z.string(), ai: z.boolean().default(false) }).optional(),
      })),
      text: z.object({
        lede: z.string(),
        sections: z.array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) })),
      }).optional(),
      site: z.object({ label: z.string(), latitude: z.number(), longitude: z.number(), area_sqm: z.number(), elevation_m: z.number() }),
      climate: z.record(z.string(), z.string()).optional(),
      climateData: z.object({
        station_note: z.string(),
        monthly: z.array(z.object({ month: z.number(), temp_mean: z.number(), temp_max: z.number(), temp_min: z.number(), rh_mean: z.number(), rain_mm: z.number(), wind_mean: z.number(), calm_pct: z.number() })).length(12),
        wind_rose: z.object({ sectors_from_north_deg: z.array(z.number()), pct_of_hours: z.array(z.number()), calm_pct: z.number() }),
      }).optional(),
      sitePlan: z.object({
        latitude: z.number(), longitude: z.number(), timezone: z.number(),
        boundary: z.array(z.tuple([z.number(), z.number()])),
        roofs: z.array(z.object({ name: z.string(), height_m: z.number(), outline: z.array(z.tuple([z.number(), z.number()])) })),
      }).optional(),
      files: z.array(z.string()),
    }),
});

export const collections = { projects };
