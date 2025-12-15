import type {
    BrowserConnectOptions,
    BrowserLaunchArgumentOptions,
    LaunchOptions,
    Page,
} from "puppeteer";
import ChromeAppPlugin from "puppeteer-extra-plugin-stealth/evasions/chrome.app";
import ChromeCsiPlugin from "puppeteer-extra-plugin-stealth/evasions/chrome.csi";
import ChromeLoadTimesPlugin from "puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes";
import ChromeRuntimePlugin from "puppeteer-extra-plugin-stealth/evasions/chrome.runtime";
import IFrameContentWindowPlugin from "puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow";
import MediaCodecsPlugin from "puppeteer-extra-plugin-stealth/evasions/media.codecs";
import NavigatorHardwareConcurrencyPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency";
import NavigatorLanguagesPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.languages";
import NavigatorPermissionsPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.permissions";
import NavigatorPluginsPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.plugins";
import NavigatorVendorPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.vendor";
import NavigatorWebdriverPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.webdriver";
import SourceurlPlugin from "puppeteer-extra-plugin-stealth/evasions/sourceurl";
import UserAgentOverridePlugin from "puppeteer-extra-plugin-stealth/evasions/user-agent-override";
import WebglVendorPlugin from "puppeteer-extra-plugin-stealth/evasions/webgl.vendor";
import WindowOuterdimensionsPlugin from "puppeteer-extra-plugin-stealth/evasions/window.outerdimensions";

export const RESPONSIBLE_AUTOMATION_MESSAGE =
    "Automation must remain transparent: respect rate limits, honor robots.txt, and disclose opt-in evasions before running tests.";

export type LaunchConfiguration = LaunchOptions &
    BrowserLaunchArgumentOptions &
    BrowserConnectOptions;

export interface RateLimitProfile {
    site: string;
    requestsPerMinute: number;
    burst: number;
}

type HookName = "onPageCreated" | "beforeLaunch" | "beforeConnect";

export interface StealthTelemetryEvent {
    hook: HookName | "safeguard";
    plugin: string;
    status: "success" | "error";
    details?: Record<string, unknown>;
    error?: Error;
}

export interface TelemetrySink {
    track: (event: StealthTelemetryEvent) => void;
}

export interface StealthPluginHooks {
    name: string;
    onPageCreated?: (page: Page) => Promise<void> | void;
    beforeLaunch?: (options: LaunchConfiguration) => Promise<LaunchConfiguration | void> | LaunchConfiguration | void;
    beforeConnect?: () => Promise<void> | void;
}

export interface StealthHandlerOptions {
    plugins?: StealthPluginHooks[];
    modules?: string[];
    rateLimitProfile?: RateLimitProfile;
    telemetry?: TelemetrySink;
    strictCompliance?: boolean;
}

export type PluginFactory = () => Partial<StealthPluginHooks> & { name?: string };

const DEFAULT_ARGS = ["--disable-blink-features=AutomationControlled"];
const DEFAULT_IGNORE_ARGS = ["--enable-automation"];
const DEFAULT_HEADLESS = "new" as unknown as LaunchConfiguration["headless"];

export const pluginFactories = [
    { name: "chrome.app", factory: ChromeAppPlugin },
    { name: "chrome.csi", factory: ChromeCsiPlugin },
    { name: "chrome.loadTimes", factory: ChromeLoadTimesPlugin },
    { name: "chrome.runtime", factory: ChromeRuntimePlugin },
    { name: "iframe.contentWindow", factory: IFrameContentWindowPlugin },
    { name: "media.codecs", factory: MediaCodecsPlugin },
    { name: "navigator.hardwareConcurrency", factory: NavigatorHardwareConcurrencyPlugin },
    { name: "navigator.languages", factory: NavigatorLanguagesPlugin },
    { name: "navigator.permissions", factory: NavigatorPermissionsPlugin },
    { name: "navigator.plugins", factory: NavigatorPluginsPlugin },
    { name: "navigator.vendor", factory: NavigatorVendorPlugin },
    { name: "navigator.webdriver", factory: NavigatorWebdriverPlugin },
    { name: "sourceurl", factory: SourceurlPlugin },
    { name: "user-agent-override", factory: UserAgentOverridePlugin },
    { name: "webgl.vendor", factory: WebglVendorPlugin },
    { name: "window.outerdimensions", factory: WindowOuterdimensionsPlugin },
] as const satisfies ReadonlyArray<{ name: string; factory: PluginFactory }>;

const instantiateDefaultPlugins = (): StealthPluginHooks[] =>
    pluginFactories.map(({ name, factory }) => wrapPlugin(factory(), name));

export const normalizePluginName = (name: string, fallbackName: string): string => {
    if (!name) return fallbackName;
    if (name.startsWith("stealth/evasions/")) {
        return name.slice("stealth/evasions/".length);
    }
    return name;
};

const wrapPlugin = (
    plugin: Partial<StealthPluginHooks> & { name?: string },
    fallbackName: string
): StealthPluginHooks => ({
    name: normalizePluginName(plugin.name ?? fallbackName, fallbackName),
    onPageCreated: plugin.onPageCreated?.bind(plugin),
    beforeLaunch: plugin.beforeLaunch?.bind(plugin),
    beforeConnect: plugin.beforeConnect?.bind(plugin),
});

const createConsoleTelemetry = (): TelemetrySink => ({
    track: (event: StealthTelemetryEvent) => {
        if (event.hook === "safeguard") {
            // Surface compliance messaging so developers cannot miss it.
            console.info(
                `[puppeteer-stealth][safeguard] ${event.details?.message ?? RESPONSIBLE_AUTOMATION_MESSAGE}`
            );
        } else if (event.status === "error") {
            console.error(
                `[puppeteer-stealth][${event.hook}] ${event.plugin} failed`,
                event.error
            );
        }
    },
});

const resolveTelemetry = (options?: StealthHandlerOptions): TelemetrySink =>
    options?.telemetry ?? createConsoleTelemetry();

const resolvePlugins = (options?: StealthHandlerOptions): StealthPluginHooks[] => {
    if (options?.plugins) {
        return options.plugins;
    }

    const requestedModules = options?.modules;
    if (!requestedModules || requestedModules.length === 0) {
        return instantiateDefaultPlugins();
    }

    const byName = new Map<string, (typeof pluginFactories)[number]>();
    for (const entry of pluginFactories) {
        byName.set(entry.name, entry);
    }
    const unknown = requestedModules.filter((name) => !byName.has(name));
    if (unknown.length) {
        throw new Error(`Unknown stealth module(s): ${unknown.join(", ")}`);
    }

    return requestedModules.map((name) => {
        const entry = byName.get(name);
        if (!entry) {
            throw new Error(`Unknown stealth module: ${name}`);
        }
        return wrapPlugin(entry.factory(), entry.name);
    });
};

const shouldEnforceSafeguards = (options?: StealthHandlerOptions): boolean => {
    if (typeof options?.strictCompliance === "boolean") {
        return options.strictCompliance;
    }
    return process.env.PUPPETEER_STEALTH_STRICT !== "0";
};

const emitResponsibleAutomation = (
    telemetry: TelemetrySink,
    origin: HookName,
    strict: boolean,
    handlerOptions?: StealthHandlerOptions
) => {
    if (!strict) return;
    telemetry.track({
        hook: "safeguard",
        plugin: "responsible-automation",
        status: "success",
        details: {
            origin,
            message: RESPONSIBLE_AUTOMATION_MESSAGE,
            ...(handlerOptions?.modules?.length
                ? { modules: [...handlerOptions.modules] }
                : {}),
            ...(handlerOptions?.rateLimitProfile
                ? { rateLimitProfile: handlerOptions.rateLimitProfile }
                : {}),
        },
    });
};

const trackPluginResult = (
    telemetry: TelemetrySink,
    hook: HookName,
    plugin: StealthPluginHooks,
    status: "success" | "error",
    error?: Error
) => {
    telemetry.track({
        hook,
        plugin: plugin.name,
        status,
        ...(error ? { error } : {}),
    });
};

const normalizeLaunchOptions = (
    options: LaunchConfiguration = {} as LaunchConfiguration
): LaunchConfiguration => {
    const normalized: LaunchConfiguration = {
        ...options,
        args: Array.isArray(options.args) ? [...options.args] : [],
        ignoreDefaultArgs: Array.isArray(options.ignoreDefaultArgs)
            ? [...options.ignoreDefaultArgs]
            : options.ignoreDefaultArgs ?? [],
    };

    if (normalized.headless === undefined) {
        normalized.headless = DEFAULT_HEADLESS;
    }

    ensureLaunchGuards(normalized);
    return normalized;
};

const ensureLaunchGuards = (options: LaunchConfiguration) => {
    options.args = options.args ?? [];

    for (const arg of DEFAULT_ARGS) {
        if (!options.args.includes(arg)) {
            options.args.push(arg);
        }
    }

    if (options.ignoreDefaultArgs === undefined) {
        options.ignoreDefaultArgs = [...DEFAULT_IGNORE_ARGS];
        return;
    }

    if (!Array.isArray(options.ignoreDefaultArgs)) {
        return;
    }

    for (const arg of DEFAULT_IGNORE_ARGS) {
        if (!options.ignoreDefaultArgs.includes(arg)) {
            options.ignoreDefaultArgs.push(arg);
        }
    }
};

/**
 * Executes every registered plugin `onPageCreated` hook using deterministic ordering.
 * @param page Puppeteer page instance under test.
 * @param handlerOptions Optional overrides for plugin injection and telemetry sinks.
 */
export async function onPageCreated(
    page: Page,
    handlerOptions: StealthHandlerOptions = {}
): Promise<void[]> {
    const telemetry = resolveTelemetry(handlerOptions);
    const plugins = resolvePlugins(handlerOptions);
    emitResponsibleAutomation(
        telemetry,
        "onPageCreated",
        shouldEnforceSafeguards(handlerOptions),
        handlerOptions
    );

    const results: void[] = [];

    for (const plugin of plugins) {
        if (!plugin.onPageCreated) continue;
        try {
            await plugin.onPageCreated(page);
            trackPluginResult(telemetry, "onPageCreated", plugin, "success");
            results.push(undefined as void);
        } catch (error) {
            trackPluginResult(telemetry, "onPageCreated", plugin, "error", error as Error);
            throw error;
        }
    }

    return results;
}

/**
 * Applies default launch safeguards, runs plugin mutations, and returns sanitized options.
 * @param options Puppeteer launch/connect arguments, cloned before mutation to avoid side effects.
 * @param handlerOptions Optional overrides for plugin injection and telemetry sinks.
 */
export async function beforeLaunch(
    options: LaunchConfiguration = {} as LaunchConfiguration,
    handlerOptions: StealthHandlerOptions = {}
): Promise<LaunchConfiguration> {
    const telemetry = resolveTelemetry(handlerOptions);
    const plugins = resolvePlugins(handlerOptions);
    const normalized = normalizeLaunchOptions(options);
    emitResponsibleAutomation(
        telemetry,
        "beforeLaunch",
        shouldEnforceSafeguards(handlerOptions),
        handlerOptions
    );

    for (const plugin of plugins) {
        if (!plugin.beforeLaunch) continue;
        try {
            const result = await plugin.beforeLaunch(normalized);
            if (result) {
                Object.assign(normalized, result);
            }
            trackPluginResult(telemetry, "beforeLaunch", plugin, "success");
        } catch (error) {
            trackPluginResult(telemetry, "beforeLaunch", plugin, "error", error as Error);
            throw error;
        }
    }

    ensureLaunchGuards(normalized);
    return normalized;
}

/**
 * Ensures every plugin executes its `beforeConnect` hook while emitting telemetry.
 * @param handlerOptions Optional overrides for plugin injection and telemetry sinks.
 */
export async function beforeConnect(
    handlerOptions: StealthHandlerOptions = {}
): Promise<void[]> {
    const telemetry = resolveTelemetry(handlerOptions);
    const plugins = resolvePlugins(handlerOptions);
    emitResponsibleAutomation(
        telemetry,
        "beforeConnect",
        shouldEnforceSafeguards(handlerOptions),
        handlerOptions
    );

    const results: void[] = [];

    for (const plugin of plugins) {
        if (!plugin.beforeConnect) continue;
        try {
            await plugin.beforeConnect();
            trackPluginResult(telemetry, "beforeConnect", plugin, "success");
            results.push(undefined as void);
        } catch (error) {
            trackPluginResult(telemetry, "beforeConnect", plugin, "error", error as Error);
            throw error;
        }
    }

    return results;
}