import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tests": resolve(projectRoot, "tests"),
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
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.ts"],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
