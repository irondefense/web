import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const reports = defineCollection({
  loader: glob({ pattern: "**/{en,pl}.md", base: "./src/content/reports" }),
  schema: z.object({
    reportId: z.string(),
    lang: z.enum(["en", "pl"]),
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tlp: z.enum(["clear", "green", "amber", "red"]).default("clear"),
    tags: z.array(z.string()).default([]),
    yaraRules: z
      .array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          source: z.string(),
        }),
      )
      .default([]),
  }),
});

const reportIoc = defineCollection({
  loader: glob({ pattern: "**/ioc.md", base: "./src/content/reports" }),
  schema: z.object({
    reportId: z.string(),
    draft: z.boolean().default(false),
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { reports, reportIoc };
