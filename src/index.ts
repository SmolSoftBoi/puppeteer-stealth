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
    /** Promises */
    const promises: Promise<void>[] = [];

    const chromeAppPlugin = ChromeAppPlugin();
    const chromeCsiPlugin = ChromeCsiPlugin();
    const chromeLoadTimesPlugin = ChromeLoadTimesPlugin();
    const chromeRuntimePlugin = ChromeRuntimePlugin();
    const iFrameContentWindowPlugin = IFrameContentWindowPlugin();
    const mediaCodecsPlugin = MediaCodecsPlugin();
    const navigatorHardwareConcurrencyPlugin = NavigatorHardwareConcurrencyPlugin();
    const navigatorLanguagesPlugin = NavigatorLanguagesPlugin();
    const navigatorPermissionsPlugin = NavigatorPermissionsPlugin();
    const navigatorPluginsPlugin = NavigatorPluginsPlugin();
    const navigatorVendorPlugin = NavigatorVendorPlugin();
    const navigatorWebdriverPlugin = NavigatorWebdriverPlugin();
    const sourceurlPlugin = SourceurlPlugin();
    const userAgentOverridePlugin = UserAgentOverridePlugin();
    const webglVendorPlugin = WebglVendorPlugin();
    const windowOuterdimensionsPlugin = WindowOuterdimensionsPlugin();

    promises.push(chromeAppPlugin.onPageCreated(page));
    promises.push(chromeCsiPlugin.onPageCreated(page));
    promises.push(chromeLoadTimesPlugin.onPageCreated(page));
    promises.push(chromeRuntimePlugin.onPageCreated(page));
    promises.push(iFrameContentWindowPlugin.onPageCreated(page));
    promises.push(mediaCodecsPlugin.onPageCreated(page));
    promises.push(navigatorHardwareConcurrencyPlugin.onPageCreated(page));
    promises.push(navigatorLanguagesPlugin.onPageCreated(page));
    promises.push(navigatorPermissionsPlugin.onPageCreated(page));
    promises.push(navigatorPluginsPlugin.onPageCreated(page));
    promises.push(navigatorVendorPlugin.onPageCreated(page));
    promises.push(navigatorWebdriverPlugin.onPageCreated(page));
    promises.push(sourceurlPlugin.onPageCreated(page));
    promises.push(userAgentOverridePlugin.onPageCreated(page));
    promises.push(webglVendorPlugin.onPageCreated(page));
    promises.push(windowOuterdimensionsPlugin.onPageCreated(page));

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