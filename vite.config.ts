import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxInject: 'import { createElement } from "@ollyrowe/core"',
    jsxFactory: "createElement",
  },
});
