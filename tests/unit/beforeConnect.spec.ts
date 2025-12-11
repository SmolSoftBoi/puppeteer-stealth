import { describe, expect, it, vi } from "vitest";
import { beforeConnect, type StealthPluginHooks } from "../../src";
import { createTelemetrySink } from "@tests/fixtures/puppeteer";

describe("beforeConnect", () => {
  it("invokes beforeConnect hooks for injected plugins", async () => {
    const telemetry = createTelemetrySink();
    const order: string[] = [];

    const alpha: StealthPluginHooks = {
      name: "alpha",
      beforeConnect: vi.fn(() => {
        order.push("alpha");
      }),
    };

    const beta: StealthPluginHooks = {
      name: "beta",
      beforeConnect: vi.fn(() => {
        order.push("beta");
      }),
    };

    await beforeConnect({
      plugins: [alpha, beta],
      telemetry,
    });

    expect(order).toEqual(["alpha", "beta"]);
    const successEvents = telemetry.events.filter(
      (event) => event.hook === "beforeConnect" && event.status === "success"
    );
    expect(successEvents.map((event) => event.plugin)).toEqual(["alpha", "beta"]);
  });

  it("propagates plugin errors", async () => {
    const telemetry = createTelemetrySink();
    const failing: StealthPluginHooks = {
      name: "failing",
      beforeConnect: vi.fn(() => {
        throw new Error("connect");
      }),
    };

    await expect(
      beforeConnect({
        plugins: [failing],
        telemetry,
      })
    ).rejects.toThrow("connect");

    const errorEvent = telemetry.events.find(
      (event) => event.hook === "beforeConnect" && event.status === "error"
    );
    expect(errorEvent?.plugin).toBe("failing");
  });
});
