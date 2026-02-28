import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "docs",
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
