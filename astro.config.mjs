import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://example.com",
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
