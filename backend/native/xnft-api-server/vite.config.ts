import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["../backpack-api/src/routes/v1/__tests__/_setup.ts"],
    threads: false,
  },
});
