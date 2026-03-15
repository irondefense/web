import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const reports = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reports" }),
  schema: z.object({
    reportId: z.string(),
    lang: z.enum(["en", "pl"]),
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tlp: z.enum(["clear", "green", "amber", "red"]).default("clear"),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { reports };
