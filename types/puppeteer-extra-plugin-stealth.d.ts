declare module "puppeteer-extra-plugin-stealth/evasions/*" {
  import type {
    BrowserConnectOptions,
    BrowserLaunchArgumentOptions,
    LaunchOptions,
    Page,
  } from "puppeteer";

  export type StealthLaunchConfiguration = LaunchOptions &
    BrowserLaunchArgumentOptions &
    BrowserConnectOptions;

  export interface StealthPluginInstance {
    name?: string;
    onPageCreated?: (page: Page) => Promise<void> | void;
    beforeLaunch?: (
      options: StealthLaunchConfiguration
    ) =>
      | Promise<StealthLaunchConfiguration | void>
      | StealthLaunchConfiguration
      | void;
    beforeConnect?: () => Promise<void> | void;
  }

  export default function createStealthPlugin(): StealthPluginInstance;
}
