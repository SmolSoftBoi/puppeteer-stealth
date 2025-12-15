import { describe, expect, it } from "vitest";
import { onPageCreated } from "../../src";
import { createMockPage, createTelemetrySink } from "@tests/fixtures/puppeteer";
import { INTEGRATION_STEALTH_MODULES } from "@tests/fixtures/pluginManifest";

describe("integration: real stealth plugin hooks", () => {
  it("executes onPageCreated once for each selected module", async () => {
    const telemetry = createTelemetrySink();

    await onPageCreated(createMockPage(), {
      telemetry,
      modules: INTEGRATION_STEALTH_MODULES,
    });

    const hookEvents = telemetry.events.filter(
      (event) => event.hook === "onPageCreated" && event.status === "success"
    );

    const executed = hookEvents.map((event) => event.plugin);
    expect(new Set(executed)).toEqual(new Set(INTEGRATION_STEALTH_MODULES));

    for (const moduleName of INTEGRATION_STEALTH_MODULES) {
      expect(executed.filter((name) => name === moduleName)).toHaveLength(1);
    }
  });
});
