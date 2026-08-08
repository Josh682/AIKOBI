import type { Browser, BrowserContext, Page } from 'playwright';
import type { ProxyConfig } from './proxy.rotator.js';
import { logger } from '../utils/logger.js';

// User-Agent pool — modern Chrome on Windows/Mac/Android
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export interface ContextOptions {
  proxy?: ProxyConfig | null;
  locale?: string;
  timezone?: string;
}

/**
 * Creates a stealth-configured browser context per scraping job.
 * Each context is isolated (cookies, storage) — like an incognito window.
 */
export class ContextFactory {
  /**
   * Create a new stealth browser context
   */
  static async create(browser: Browser, options: ContextOptions = {}): Promise<BrowserContext> {
    const userAgent = randomItem(USER_AGENTS);
    const viewport = randomItem(VIEWPORTS);
    const proxy = options.proxy;

    const context = await browser.newContext({
      userAgent,
      viewport,
      locale: options.locale ?? 'id-ID',
      timezoneId: options.timezone ?? 'Asia/Jakarta',
      ...(proxy
        ? {
            proxy: {
              server: proxy.server,
              username: proxy.username,
              password: proxy.password,
            },
          }
        : {}),
      // Fake geolocation — Jakarta
      geolocation: { latitude: -6.2088, longitude: 106.8456 },
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    // ─── Anti-Detection Scripts ─────────────────────────────
    await context.addInitScript(() => {
      // Remove webdriver flag
      Object.defineProperty(navigator, 'webdriver', { get: () => false });

      // Fake plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' },
        ],
      });

      // Fake languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['id-ID', 'id', 'en-US', 'en'],
      });

      // Fake hardware concurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });

      // Overwrite chrome object
      // @ts-expect-error intentional
      window.chrome = { runtime: {} };

      // Suppress automation detection
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 1 });
    });

    logger.debug({ proxy: proxy?.server ?? 'direct', userAgent: userAgent.substring(0, 50) }, 'Context created');
    return context;
  }

  /**
   * Simulate human-like behavior on a page
   */
  static async humanize(page: Page): Promise<void> {
    // Random mouse movement
    const x = 200 + Math.random() * 400;
    const y = 200 + Math.random() * 300;
    await page.mouse.move(x, y, { steps: 10 });

    // Random scroll
    await page.evaluate(() => {
      window.scrollBy(0, Math.random() * 300 + 100);
    });

    // Random short delay (300ms - 1.2s)
    await page.waitForTimeout(300 + Math.random() * 900);
  }
}
