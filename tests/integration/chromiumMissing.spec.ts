import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import puppeteer = require("puppeteer");

describe("integration: chromium availability", () => {
  const puppeteerWithExecutablePath = puppeteer as unknown as {
    executablePath?: (channel?: string) => string;
  };

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    puppeteerWithExecutablePath.executablePath?.();
  const chromiumAvailable = Boolean(executablePath && existsSync(executablePath));

  const chromiumTest = chromiumAvailable ? test : test.skip;
  const testName = chromiumAvailable
    ? "has a local Chromium executable"
    : "skips when Chromium is missing (set PUPPETEER_EXECUTABLE_PATH or reinstall Puppeteer)";

  chromiumTest(
    testName,
    {
      timeout: 10_000,
    },
    () => {
      expect(chromiumAvailable).toBe(true);
    }
  );
});
