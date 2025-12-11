import * as dns from "node:dns";
import * as http from "node:http";
import * as https from "node:https";
import * as net from "node:net";
import * as tls from "node:tls";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

const GUARD_MESSAGE =
  "Outbound network calls are forbidden during tests. Use fixtures or opt-in overrides.";

const spies: Array<ReturnType<typeof vi.spyOn>> = [];

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
  return (...args: unknown[]) => {
    const target = extractTarget(args[0]);
    telemetry.guardEvents.push({ operation, target });
    throw new Error(
      `[network-guard] ${operation} prevented outbound access${target ? ` to ${target}` : ""}. ${GUARD_MESSAGE}`
    );
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

beforeAll(() => {
  process.env.PUPPETEER_STEALTH_STRICT = process.env.PUPPETEER_STEALTH_STRICT ?? "1";

  spies.push(vi.spyOn(http, "request").mockImplementation(guard("http.request")));
  spies.push(vi.spyOn(http, "get").mockImplementation(guard("http.get")));
  spies.push(vi.spyOn(https, "request").mockImplementation(guard("https.request")));
  spies.push(vi.spyOn(https, "get").mockImplementation(guard("https.get")));
  spies.push(vi.spyOn(net, "connect").mockImplementation(guard("net.connect")));
  spies.push(vi.spyOn(tls, "connect").mockImplementation(guard("tls.connect")));
  spies.push(vi.spyOn(dns, "lookup").mockImplementation(guard("dns.lookup")));

  if (typeof fetch === "function") {
    const fetchGuard = (...args: Parameters<typeof fetch>): Promise<Response> => {
      const target = extractTarget(args[0]);
      telemetry.guardEvents.push({ operation: "fetch", target });
      return Promise.reject(
        new Error(
          `[network-guard] fetch prevented outbound access${target ? ` to ${target}` : ""}. ${GUARD_MESSAGE}`
        )
      );
    };

    spies.push(vi.spyOn(globalThis, "fetch").mockImplementation(fetchGuard as typeof fetch));
  }
});

afterAll(() => {
  spies.forEach((spy) => spy.mockRestore());
});

afterEach(() => {
  telemetry.guardEvents.length = 0;
});
