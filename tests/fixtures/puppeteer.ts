import { vi } from "vitest";
import type {
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
  LaunchOptions,
  Page,
} from "puppeteer";

export type LaunchConfiguration = LaunchOptions &
  BrowserLaunchArgumentOptions &
  BrowserConnectOptions;

export interface RateLimitProfile {
  site: string;
  requestsPerMinute: number;
  burst: number;
}

export interface TelemetryEvent {
  hook: string;
  plugin: string;
  status: string;
  details?: Record<string, unknown>;
  error?: Error;
}

export interface RecordingTelemetrySink {
  events: TelemetryEvent[];
  track: (event: TelemetryEvent) => void;
  reset: () => void;
}

export const createTelemetrySink = (): RecordingTelemetrySink => {
  const events: TelemetryEvent[] = [];
  return {
    events,
    track: vi.fn((event: TelemetryEvent) => {
      events.push(event);
    }),
    reset: () => {
      events.splice(0, events.length);
    },
  };
};

export const createMockPage = (overrides: Partial<Page> = {}): Page => {
  const page = {
    setUserAgent: vi.fn(),
    evaluateOnNewDocument: vi.fn(),
    on: vi.fn(),
    exposeFunction: vi.fn(),
    ...overrides,
  } as Partial<Page>;

  return page as Page;
};

export const createLaunchOptions = (
  overrides: Partial<LaunchConfiguration> = {}
): LaunchConfiguration => {
  return {
    headless: "new",
    args: ["--disable-blink-features=AutomationControlled"],
    ignoreDefaultArgs: ["--enable-automation"],
    ...overrides,
  } as LaunchConfiguration;
};

export const createRateLimitProfile = (
  overrides: Partial<RateLimitProfile> = {}
): RateLimitProfile => ({
  site: overrides.site ?? "example.test",
  requestsPerMinute: overrides.requestsPerMinute ?? 60,
  burst: overrides.burst ?? 10,
});