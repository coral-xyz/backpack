import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./src/routes/v1/__tests__/_setup.ts"],
    threads: false,
  },
});
