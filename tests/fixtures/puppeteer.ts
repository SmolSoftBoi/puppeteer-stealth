import { vi } from "vitest";
import type { Page } from "puppeteer";
import type {
  LaunchConfiguration,
  RateLimitProfile,
  StealthTelemetryEvent,
  TelemetrySink,
} from "../../src";

export interface RecordingTelemetrySink extends TelemetrySink {
  events: StealthTelemetryEvent[];
  reset: () => void;
}

export const createTelemetrySink = (): RecordingTelemetrySink => {
  const events: StealthTelemetryEvent[] = [];
  return {
    events,
    track: vi.fn((event: StealthTelemetryEvent) => {
      events.push(event);
    }) as TelemetrySink["track"],
    reset: () => {
      events.splice(0, events.length);
    },
  };
};

export const createMockPage = (overrides: Partial<Page> = {}): Page => {
  const page = {
    browser: vi.fn(() => ({
      userAgent: vi.fn(async () => "Mozilla/5.0"),
      version: vi.fn(async () => "HeadlessChrome/0.0.0"),
    })),
    _client: vi.fn(() => ({
      send: vi.fn(async () => ({})),
    })),
    setUserAgent: vi.fn(),
    evaluate: vi.fn(),
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