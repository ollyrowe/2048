import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        lintCommand: "eslint . --ext ts,tsx",
      },
    }),
  ],
  esbuild: {
    jsxInject: 'import { createElement } from "@ollyrowe/core"',
    jsxFactory: "createElement",
  },
  base: "/2048/",
});
