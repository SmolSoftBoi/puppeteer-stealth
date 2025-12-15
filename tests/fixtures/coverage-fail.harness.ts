import { describe, it } from "vitest";

describe("coverage harness", () => {
  it("intentionally does not touch src", () => {
    // This file exists to validate that the coverage thresholds are enforced.
    // It should not import anything from `src/**`.
  });
});
