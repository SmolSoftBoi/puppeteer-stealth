import { afterEach, beforeAll, vi } from "vitest";

const GUARD_MESSAGE =
  "Outbound network calls are forbidden during tests. Use fixtures or opt-in overrides.";

type GuardEvent = { operation: string; target?: string };

declare global {
  // eslint-disable-next-line no-var
  var __STEALTH_TEST_TELEMETRY__:
    | {
        guardEvents: GuardEvent[];
      }
    | undefined;
}

const telemetry = (globalThis.__STEALTH_TEST_TELEMETRY__ ??= {
  guardEvents: [] as GuardEvent[],
});

export const getNetworkTelemetry = (): typeof telemetry => telemetry;

const guard = (operation: string) => {
  return (...args: unknown[]): never => {
    const target = extractTarget(args[0]);
    telemetry.guardEvents.push({ operation, target });
    throw new Error(
      `[network-guard] ${operation} prevented outbound access${target ? ` to ${target}` : ""}. ${GUARD_MESSAGE}`
    );
  };
};

const guardAsync = (operation: string) => {
  const syncGuard = guard(operation);
  return (...args: unknown[]) => {
    try {
      syncGuard(...args);
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error(GUARD_MESSAGE));
  };
};

const extractTarget = (input: unknown): string | undefined => {
  if (!input) return undefined;
  if (typeof input === "string") return input;
  if (typeof input === "object" && "host" in (input as Record<string, unknown>)) {
    return String((input as { host?: unknown }).host ?? "");
  }
  return undefined;
};

vi.mock("node:http", async () => {
  const actual = await vi.importActual<typeof import("node:http")>("node:http");
  return {
    ...actual,
    request: guard("http.request") as unknown as typeof actual.request,
    get: guard("http.get") as unknown as typeof actual.get,
  };
});

vi.mock("node:https", async () => {
  const actual = await vi.importActual<typeof import("node:https")>("node:https");
  return {
    ...actual,
    request: guard("https.request") as unknown as typeof actual.request,
    get: guard("https.get") as unknown as typeof actual.get,
  };
});

vi.mock("node:net", async () => {
  const actual = await vi.importActual<typeof import("node:net")>("node:net");
  return {
    ...actual,
    connect: guard("net.connect") as unknown as typeof actual.connect,
  };
});

vi.mock("node:tls", async () => {
  const actual = await vi.importActual<typeof import("node:tls")>("node:tls");
  return {
    ...actual,
    connect: guard("tls.connect") as unknown as typeof actual.connect,
  };
});

vi.mock("node:dns", async () => {
  const actual = await vi.importActual<typeof import("node:dns")>("node:dns");
  return {
    ...actual,
    lookup: guard("dns.lookup") as unknown as typeof actual.lookup,
  };
});

beforeAll(() => {
  process.env.PUPPETEER_STEALTH_STRICT = process.env.PUPPETEER_STEALTH_STRICT ?? "1";

  if (typeof fetch === "function") {
    vi.spyOn(globalThis, "fetch").mockImplementation(guardAsync("fetch") as typeof fetch);
  }
});

afterEach(() => {
  telemetry.guardEvents.length = 0;
});
