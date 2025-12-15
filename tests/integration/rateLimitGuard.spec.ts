import { describe, expect, it } from "vitest";
import { beforeConnect, beforeLaunch } from "../../src";
import {
  createLaunchOptions,
  createRateLimitProfile,
  createTelemetrySink,
} from "@tests/fixtures/puppeteer";
import { getNetworkTelemetry } from "@tests/setup/network-guard";

describe("integration: rate-limit metadata + offline guard", () => {
  it("records the rate-limit profile in safeguard telemetry without touching network APIs", async () => {
    const telemetry = createTelemetrySink();
    const rateLimitProfile = createRateLimitProfile({
      site: "example.test",
      requestsPerMinute: 42,
      burst: 7,
    });

    await beforeLaunch(createLaunchOptions(), {
      telemetry,
      plugins: [],
      rateLimitProfile,
    });

    await beforeConnect({ telemetry, plugins: [], rateLimitProfile });

    expect(getNetworkTelemetry().guardEvents).toHaveLength(0);

    const safeguardEvents = telemetry.events.filter((event) => event.hook === "safeguard");
    expect(safeguardEvents.length).toBeGreaterThanOrEqual(2);
    expect(safeguardEvents[0]).toMatchObject({
      plugin: "responsible-automation",
      details: {
        rateLimitProfile,
      },
    });
  });
});
