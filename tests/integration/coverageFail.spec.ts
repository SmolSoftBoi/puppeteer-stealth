import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("integration: coverage enforcement", () => {
  it("exits non-zero when coverage thresholds are not met", () => {
    const reportsDirectory = ".vitest/coverage-fail";
    rmSync(reportsDirectory, { recursive: true, force: true });

    const result = spawnSync(
      "yarn",
      [
        "-s",
        "vitest",
        "run",
        "--config",
        "vitest.config.ts",
        "--coverage",
        "--coverage.reportsDirectory",
        reportsDirectory,
        "tests/fixtures/coverage-fail.harness.ts",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      }
    );

    rmSync(reportsDirectory, { recursive: true, force: true });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/coverage|threshold/i);
  });
});
