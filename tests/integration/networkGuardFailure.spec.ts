import { describe, expect, it } from "vitest";
import { RESPONSIBLE_AUTOMATION_MESSAGE } from "../../src";
import { getNetworkTelemetry } from "@tests/setup/network-guard";

describe("integration: network guard", () => {
  it("blocks outbound fetch and surfaces compliance messaging", async () => {
    await expect(fetch("https://example.com"))
      .rejects.toThrowError(/\[network-guard\]/);

    await expect(fetch("https://example.com")).rejects.toThrowError(
      RESPONSIBLE_AUTOMATION_MESSAGE
    );

    expect(getNetworkTelemetry().guardEvents.length).toBeGreaterThan(0);
  });
});
