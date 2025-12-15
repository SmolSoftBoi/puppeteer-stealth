import { describe, expect, it, vi } from "vitest";
import { beforeConnect, beforeLaunch, onPageCreated } from "../../src";
import { createLaunchOptions, createMockPage } from "@tests/fixtures/puppeteer";

describe("coverage: internal branches", () => {
  it("uses console telemetry for safeguard messages by default", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    await beforeConnect({ plugins: [], strictCompliance: true });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    infoSpy.mockRestore();
  });

  it("uses console telemetry for plugin errors by default", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      onPageCreated(createMockPage(), {
        strictCompliance: false,
        plugins: [
          {
            name: "thrower",
            onPageCreated: () => {
              throw new Error("boom");
            },
          },
        ],
      })
    ).rejects.toThrow("boom");

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("throws for unknown module selections", async () => {
    await expect(
      beforeConnect({
        // no plugins provided, so module selection is used
        modules: ["does-not-exist"],
        strictCompliance: false,
      })
    ).rejects.toThrow(/Unknown stealth module/);
  });

  it("instantiates default plugins when modules is an empty list", async () => {
    const options = await beforeLaunch(createLaunchOptions({
      args: [],
      ignoreDefaultArgs: undefined,
      headless: undefined,
    }), {
      modules: [],
      strictCompliance: false,
    });

    expect(options.args).toContain("--disable-blink-features=AutomationControlled");
    expect(options.ignoreDefaultArgs).toContain("--enable-automation");
  });

  it("preserves ignoreDefaultArgs boolean values", async () => {
    const options = await beforeLaunch(
      createLaunchOptions({ ignoreDefaultArgs: true }),
      { strictCompliance: false }
    );

    expect(options.ignoreDefaultArgs).toBe(true);
  });

  it("preserves ignoreDefaultArgs predicate values", async () => {
    const predicate = (arg: string) => arg.includes("automation");

    const options = await beforeLaunch(
      createLaunchOptions({
        ignoreDefaultArgs: predicate as unknown as NonNullable<
          ReturnType<typeof createLaunchOptions>["ignoreDefaultArgs"]
        >,
      }),
      { strictCompliance: false }
    );

    expect(options.ignoreDefaultArgs).toBe(predicate);
  });

  it("rebuilds launch args when a plugin clears them", async () => {
    const options = await beforeLaunch(createLaunchOptions(), {
      strictCompliance: false,
      plugins: [
        {
          name: "arg-clearer",
          beforeLaunch: () => ({ args: undefined as unknown as string[] }),
        },
      ],
    });

    expect(options.args).toContain("--disable-blink-features=AutomationControlled");
  });
});
