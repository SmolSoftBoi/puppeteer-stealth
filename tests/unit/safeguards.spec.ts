import { describe, expect, it } from "vitest";
import {
  RESPONSIBLE_AUTOMATION_MESSAGE,
  beforeConnect,
  beforeLaunch,
  onPageCreated,
} from "../../src";
import {
  createLaunchOptions,
  createMockPage,
  createTelemetrySink,
} from "@tests/fixtures/puppeteer";

describe("responsible automation safeguards", () => {
  it("emits telemetry for every hook by default", async () => {
    const telemetry = createTelemetrySink();

    await onPageCreated(createMockPage(), { plugins: [], telemetry });
    await beforeLaunch(createLaunchOptions(), { plugins: [], telemetry });
    await beforeConnect({ plugins: [], telemetry });

    const safeguardEvents = telemetry.events.filter((event) => event.hook === "safeguard");
    expect(safeguardEvents).toHaveLength(3);
    expect(safeguardEvents[0]).toMatchObject({
      plugin: "responsible-automation",
      details: {
        message: RESPONSIBLE_AUTOMATION_MESSAGE,
        origin: "onPageCreated",
      },
    });
  });

  it("can opt out when strictCompliance is false", async () => {
    const telemetry = createTelemetrySink();

    await beforeLaunch(createLaunchOptions(), {
      plugins: [],
      telemetry,
      strictCompliance: false,
    });

    const safeguardEvents = telemetry.events.filter((event) => event.hook === "safeguard");
    expect(safeguardEvents).toHaveLength(0);
  });
});
