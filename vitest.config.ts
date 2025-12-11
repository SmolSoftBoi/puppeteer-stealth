import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tests": resolve(rootDir, "tests"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    exclude: ["dist/**", "coverage/**", "node_modules/**"],
    setupFiles: ["tests/setup/network-guard.ts"],
    globals: true,
    reporters: ["default"],
    coverage: {
      provider: "c8",
      reportsDirectory: "coverage",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.ts"],
      thresholds: {
        statements: 0.9,
        branches: 0.9,
        functions: 1,
        lines: 0.9,
      },
    },
  },
});
