import path from "path";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import mdx from "@mdx-js/rollup";

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.md"],
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
