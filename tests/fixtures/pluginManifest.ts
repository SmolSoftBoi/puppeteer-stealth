import {
  normalizePluginName,
  pluginFactories as productionPluginFactories,
  type LaunchConfiguration,
  type PluginFactory,
  type StealthPluginHooks,
} from "../../src";

export type StealthModuleName =
  (typeof productionPluginFactories)[number]["name"];

const pluginFactories: ReadonlyArray<{
  name: StealthModuleName;
  factory: PluginFactory;
}> = productionPluginFactories;

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
  name: normalizePluginName(plugin.name ?? fallbackName, fallbackName),
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
