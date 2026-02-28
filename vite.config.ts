import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
