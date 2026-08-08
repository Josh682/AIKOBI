import { chromium, type Browser } from 'playwright';
import { logger } from '../utils/logger.js';

/**
 * Singleton browser instance manager.
 * Keeps one browser alive and creates contexts per job.
 * Avoids the heavy cost of launching a new browser for every scrape.
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private launchCount = 0;

  private constructor() {}

  static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  async getBrowser(headless = true): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    logger.info({ attempt: ++this.launchCount }, '🌐 Launching Chromium browser');

    this.browser = await chromium.launch({
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--lang=id-ID,id',
        // Anti-detection
        '--disable-blink-features=AutomationControlled',
        '--exclude-switches=enable-automation',
        '--disable-extensions',
        // Force HTTP/1.1 — prevents ERR_HTTP2_PROTOCOL_ERROR on anti-bot sites
        '--disable-http2',
        '--use-spdy=off',
        // Extra stealth
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    this.browser.on('disconnected', () => {
      logger.warn('🔴 Browser disconnected — will re-launch on next request');
      this.browser = null;
    });

    logger.info('✅ Browser ready');
    return this.browser;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }
}
