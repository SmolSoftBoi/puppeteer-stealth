import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page } from 'puppeteer';
import ChromeAppPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.app';
import ChromeCsiPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.csi';
import ChromeLoadTimesPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes';
import ChromeRuntimePlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime';
import IFrameContentWindowPlugin from 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow';
import MediaCodecsPlugin from 'puppeteer-extra-plugin-stealth/evasions/media.codecs';
import NavigatorHardwareConcurrencyPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency';
import NavigatorLanguagesPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.languages';
import NavigatorPermissionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions';
import NavigatorPluginsPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins';
import NavigatorVendorPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.vendor';
import NavigatorWebdriverPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver';
import SourceurlPlugin from 'puppeteer-extra-plugin-stealth/evasions/sourceurl';
import UserAgentOverridePlugin from 'puppeteer-extra-plugin-stealth/evasions/user-agent-override';
import WebglVendorPlugin from 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor';
import WindowOuterdimensionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions';

/**
 * On Page Created
 * @param page Page
 */
export async function onPageCreated(page: Page): Promise<void[]> {
    console.debug('onPageCreated is called');

    /** Promises */
    const promises: Promise<void>[] = [];

    const plugins = [
        ChromeAppPlugin(),
        ChromeCsiPlugin(),
        ChromeLoadTimesPlugin(),
        ChromeRuntimePlugin(),
        IFrameContentWindowPlugin(),
        MediaCodecsPlugin(),
        NavigatorHardwareConcurrencyPlugin(),
        NavigatorLanguagesPlugin(),
        NavigatorPermissionsPlugin(),
        NavigatorPluginsPlugin(),
        NavigatorVendorPlugin(),
        NavigatorWebdriverPlugin(),
        SourceurlPlugin(),
        UserAgentOverridePlugin(),
        WebglVendorPlugin(),
        WindowOuterdimensionsPlugin(),
    ];

    // Call onPageCreated on all plugin instances
    for (const plugin of plugins) {
        promises.push(plugin.onPageCreated(page));
    }

    return Promise.all(promises);
}

/**
 * Before Launch
 * @param options Options
 */
export async function beforeLaunch(options: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions): Promise<LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions> {
    if (!options.args) options.args = [];

    const navigatorWebdriverPlugin = NavigatorWebdriverPlugin();
    const userAgentOverridePlugin = UserAgentOverridePlugin();
    const windowOuterdimensionsPlugin = WindowOuterdimensionsPlugin();

    await navigatorWebdriverPlugin.beforeLaunch(options);
    await userAgentOverridePlugin.beforeLaunch(options);

    options = await windowOuterdimensionsPlugin.beforeLaunch(options);

    return options;
}

/**
 * Before Launch
 */
export async function beforeConnect(): Promise<void[]> {
    /** Promises */
    const promises: Promise<void>[] = [];

    const userAgentOverridePlugin = UserAgentOverridePlugin();

    promises.push(userAgentOverridePlugin.beforeConnect());

    return Promise.all(promises);
}