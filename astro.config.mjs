import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  site: "https://example.com",
  integrations: [icon()],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
