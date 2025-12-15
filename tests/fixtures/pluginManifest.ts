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

import type { LaunchConfiguration, StealthPluginHooks } from "../../src";

export type StealthModuleName =
  | "chrome.app"
  | "chrome.csi"
  | "chrome.loadTimes"
  | "chrome.runtime"
  | "iframe.contentWindow"
  | "media.codecs"
  | "navigator.hardwareConcurrency"
  | "navigator.languages"
  | "navigator.permissions"
  | "navigator.plugins"
  | "navigator.vendor"
  | "navigator.webdriver"
  | "sourceurl"
  | "user-agent-override"
  | "webgl.vendor"
  | "window.outerdimensions";

type PluginFactory = () => Partial<StealthPluginHooks> & { name?: string };

const pluginFactories: Array<{ name: StealthModuleName; factory: PluginFactory }> = [
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
];

export const ALL_STEALTH_MODULES: StealthModuleName[] = pluginFactories.map(
  (plugin) => plugin.name
);

export const INTEGRATION_STEALTH_MODULES: StealthModuleName[] = [
  "navigator.webdriver",
  "user-agent-override",
  "webgl.vendor",
];

const wrapPlugin = (
  plugin: Partial<StealthPluginHooks> & { name?: string },
  fallbackName: StealthModuleName
): StealthPluginHooks => ({
  name:
    plugin.name && plugin.name.startsWith("stealth/evasions/")
      ? plugin.name.slice("stealth/evasions/".length)
      : plugin.name ?? fallbackName,
  onPageCreated: plugin.onPageCreated?.bind(plugin),
  beforeLaunch: plugin.beforeLaunch?.bind(plugin) as
    | ((options: LaunchConfiguration) => Promise<LaunchConfiguration | void> | LaunchConfiguration | void)
    | undefined,
  beforeConnect: plugin.beforeConnect?.bind(plugin),
});

export type HookCounters = Record<
  string,
  {
    onPageCreated: number;
    beforeLaunch: number;
    beforeConnect: number;
  }
>;

export const createHookCounters = (names: readonly string[]): HookCounters =>
  Object.fromEntries(
    names.map((name) => [
      name,
      { onPageCreated: 0, beforeLaunch: 0, beforeConnect: 0 },
    ])
  );

export const createRealStealthPlugins = (
  modules: readonly StealthModuleName[] = ALL_STEALTH_MODULES
): StealthPluginHooks[] => {
  const byName = new Map(
    pluginFactories.map((entry) => [entry.name, entry] as const)
  );

  return modules.map((name) => {
    const entry = byName.get(name);
    if (!entry) {
      throw new Error(`Unknown stealth module: ${name}`);
    }
    return wrapPlugin(entry.factory(), entry.name);
  });
};

export const attachHookCounters = (
  plugins: readonly StealthPluginHooks[],
  counters: HookCounters
): StealthPluginHooks[] => {
  return plugins.map((plugin) => {
    const onPageCreatedHook = plugin.onPageCreated;
    const beforeLaunchHook = plugin.beforeLaunch;
    const beforeConnectHook = plugin.beforeConnect;

    return {
      ...plugin,
      onPageCreated: onPageCreatedHook
        ? async (page) => {
            counters[plugin.name] ??= {
              onPageCreated: 0,
              beforeLaunch: 0,
              beforeConnect: 0,
            };
            counters[plugin.name].onPageCreated += 1;
            return onPageCreatedHook(page);
          }
        : undefined,
      beforeLaunch: beforeLaunchHook
        ? async (options) => {
            counters[plugin.name] ??= {
              onPageCreated: 0,
              beforeLaunch: 0,
              beforeConnect: 0,
            };
            counters[plugin.name].beforeLaunch += 1;
            return beforeLaunchHook(options);
          }
        : undefined,
      beforeConnect: beforeConnectHook
        ? async () => {
            counters[plugin.name] ??= {
              onPageCreated: 0,
              beforeLaunch: 0,
              beforeConnect: 0,
            };
            counters[plugin.name].beforeConnect += 1;
            return beforeConnectHook();
          }
        : undefined,
    };
  });
};
