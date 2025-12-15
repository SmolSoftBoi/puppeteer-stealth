import { describe, expect, it, vi } from "vitest";
import { createLaunchOptions, createTelemetrySink } from "@tests/fixtures/puppeteer";

describe("coverage: plugin name normalization", () => {
  it("leaves non-prefixed names unchanged", async () => {
    const { normalizePluginName } = await import("../../src");

    expect(normalizePluginName("custom.plugin", "fallback")).toBe(
      "custom.plugin"
    );
  });

  it("falls back to the module key when a plugin reports an empty name", async () => {
    vi.resetModules();

    vi.doMock("puppeteer-extra-plugin-stealth/evasions/chrome.app", () => {
      return {
        default: () => ({
          name: "",
          beforeLaunch: (options: unknown) => options,
        }),
      };
    });

    const { beforeLaunch } = await import("../../src");
    const telemetry = createTelemetrySink();

    await beforeLaunch(createLaunchOptions(), {
      modules: ["chrome.app"],
      telemetry,
      strictCompliance: false,
    });

    const event = telemetry.events.find(
      (entry) => entry.hook === "beforeLaunch" && entry.status === "success"
    );

    expect(event?.plugin).toBe("chrome.app");
  });
});
