import { describe, expect, it, vi } from "vitest";
import {
  beforeLaunch,
  type LaunchConfiguration,
  type StealthPluginHooks,
} from "../../src";
import { createLaunchOptions, createTelemetrySink } from "@tests/fixtures/puppeteer";

describe("beforeLaunch", () => {
  it("enforces safe defaults when args are missing", async () => {
    const telemetry = createTelemetrySink();
    const result = await beforeLaunch({} as LaunchConfiguration, {
      plugins: [],
      telemetry,
    });

    expect(result.headless).toBe("new");
    expect(result.args).toContain("--disable-blink-features=AutomationControlled");
    expect(result.ignoreDefaultArgs).toContain("--enable-automation");
    expect(telemetry.events.find((event) => event.hook === "beforeLaunch")).toBeUndefined();
  });

  it("applies plugin mutations in deterministic order without mutating the original object", async () => {
    const telemetry = createTelemetrySink();
    const original = createLaunchOptions({ args: [] });
    const executionOrder: string[] = [];

    const alpha: StealthPluginHooks = {
      name: "alpha",
      beforeLaunch: vi.fn(async (options) => {
        executionOrder.push("alpha");
        options.args?.push("--alpha");
        return options;
      }),
    };

    const beta: StealthPluginHooks = {
      name: "beta",
      beforeLaunch: vi.fn(async (options) => {
        executionOrder.push("beta");
        options.args?.push("--beta");
        return options;
      }),
    };

    const result = await beforeLaunch(original, {
      plugins: [alpha, beta],
      telemetry,
    });

    expect(executionOrder).toEqual(["alpha", "beta"]);
    expect(result.args).toEqual([
      "--disable-blink-features=AutomationControlled",
      "--alpha",
      "--beta",
    ]);
    expect(original.args).toEqual([]);

    const successEvents = telemetry.events.filter(
      (event) => event.hook === "beforeLaunch" && event.status === "success"
    );
    expect(successEvents.map((event) => event.plugin)).toEqual(["alpha", "beta"]);
  });

  it("records telemetry for plugin failures and propagates the error", async () => {
    const telemetry = createTelemetrySink();
    const explosion = new Error("launch failed");
    const failing: StealthPluginHooks = {
      name: "failing",
      beforeLaunch: vi.fn(() => {
        throw explosion;
      }),
    };

    await expect(
      beforeLaunch(createLaunchOptions(), {
        plugins: [failing],
        telemetry,
      })
    ).rejects.toThrow("launch failed");

    const errorEvent = telemetry.events.find(
      (event) => event.hook === "beforeLaunch" && event.status === "error"
    );
    expect(errorEvent).toMatchObject({ plugin: "failing", error: explosion });
  });
});
