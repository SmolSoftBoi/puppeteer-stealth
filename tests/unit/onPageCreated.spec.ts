import { describe, expect, it, vi } from "vitest";
import { onPageCreated, type StealthPluginHooks } from "../../src";
import { createMockPage, createTelemetrySink } from "@tests/fixtures/puppeteer";

describe("onPageCreated", () => {
  it("invokes injected plugins in order and records telemetry", async () => {
    const callLog: string[] = [];
    const telemetry = createTelemetrySink();
    const alpha: StealthPluginHooks = {
      name: "alpha",
      onPageCreated: vi.fn(() => {
        callLog.push("alpha");
      }),
    };
    const beta: StealthPluginHooks = {
      name: "beta",
      onPageCreated: vi.fn(() => {
        callLog.push("beta");
      }),
    };

    await onPageCreated(createMockPage(), {
      plugins: [alpha, beta],
      telemetry,
    });

    expect(callLog).toEqual(["alpha", "beta"]);
    const successEvents = telemetry.events.filter(
      (event) => event.hook === "onPageCreated" && event.status === "success"
    );
    expect(successEvents.map((event) => event.plugin)).toEqual(["alpha", "beta"]);
  });

  it("propagates plugin failures with error telemetry", async () => {
    const telemetry = createTelemetrySink();
    const boom = new Error("boom");
    const failing: StealthPluginHooks = {
      name: "failing",
      onPageCreated: vi.fn(() => {
        throw boom;
      }),
    };

    await expect(
      onPageCreated(createMockPage(), {
        plugins: [failing],
        telemetry,
      })
    ).rejects.toThrow("boom");

    const errorEvent = telemetry.events.find(
      (event) => event.hook === "onPageCreated" && event.status === "error"
    );
    expect(errorEvent).toMatchObject({ plugin: "failing", error: boom });
  });
});
