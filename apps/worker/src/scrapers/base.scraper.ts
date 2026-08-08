import type { BrowserContext, Page } from 'playwright';
import type { Marketplace, SearchResult, ProductDetail } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { BrowserManager } from '../browser/manager.js';
import { ContextFactory } from '../browser/context.factory.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export interface ScraperOptions {
  maxRetries?: number;
  pageTimeoutMs?: number;
  navigationTimeoutMs?: number;
}

/**
 * Abstract base scraper class.
 * All marketplace-specific scrapers extend this class and implement:
 * - searchProducts()
 * - getProductDetails()
 *
 * Provides shared utilities:
 * - navigateWithRetry()
 * - detectBlock()
 * - interceptApiRequests()
 * - humanize()
 */
export abstract class BaseScraper {
  protected readonly marketplace: Marketplace;
  protected readonly proxyRotator: ProxyRotator;
  protected readonly options: Required<ScraperOptions>;

  constructor(marketplace: Marketplace, proxyRotator: ProxyRotator, options: ScraperOptions = {}) {
    this.marketplace = marketplace;
    this.proxyRotator = proxyRotator;

    const isDev = process.env.NODE_ENV !== 'production';
    this.options = {
      maxRetries: options.maxRetries ?? (isDev ? 1 : 3),
      pageTimeoutMs: options.pageTimeoutMs ?? (isDev ? 10_000 : 30_000),
      navigationTimeoutMs: options.navigationTimeoutMs ?? (isDev ? 10_000 : 45_000),
    };
  }

  // ─── Abstract Methods (marketplace-specific) ─────────────

  /**
   * Search for products by keyword
   */
  abstract searchProducts(keyword: string, options: {
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    perPage?: number;
  }): Promise<SearchResult>;

  /**
   * Get detailed product information from a URL
   */
  abstract getProductDetails(url: string, includeReviews?: boolean): Promise<ProductDetail>;

  // ─── Shared Utilities ─────────────────────────────────────

  /**
   * Navigate to a URL with retry logic and block detection.
   * Creates a fresh context per navigation to improve stealth.
   */
  protected async navigateWithRetry(url: string): Promise<{ page: Page; context: BrowserContext }> {
    let lastError: Error | null = null;
    let proxy = this.proxyRotator.next();

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      let context: BrowserContext | null = null;

      try {
        const browser = await BrowserManager.getInstance().getBrowser(env.BROWSER_HEADLESS);
        context = await ContextFactory.create(browser, { proxy });
        const page = await context.newPage();

        page.setDefaultTimeout(this.options.pageTimeoutMs);
        page.setDefaultNavigationTimeout(this.options.navigationTimeoutMs);

        // Block images/fonts/media to speed up scraping
        await page.route('**/*', (route) => {
          const type = route.request().resourceType();
          if (['image', 'font', 'media', 'stylesheet'].includes(type)) {
            return route.abort();
          }
          return route.continue();
        });

        logger.debug({ url, attempt, proxy: proxy?.server ?? 'direct' }, 'Navigating');

        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        const statusCode = response?.status() ?? 0;

        // Detect blocks/captchas
        const isBlocked = await this.detectBlock(page, statusCode);
        if (isBlocked) {
          logger.warn({ url, attempt, statusCode, proxy: proxy?.server }, 'Blocked — rotating proxy');
          if (proxy) this.proxyRotator.markFailed(proxy.server);
          proxy = this.proxyRotator.next();
          await context.close();
          await this.randomDelay(2000, 5000);
          continue;
        }

        // Humanize after successful navigation
        await ContextFactory.humanize(page);

        if (proxy) this.proxyRotator.markSuccess(proxy.server);
        return { page, context };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn({ url, attempt, error: lastError.message }, 'Navigation failed');

        if (context) await context.close().catch(() => {});
        if (proxy) this.proxyRotator.markFailed(proxy.server);
        proxy = this.proxyRotator.next();

        await this.randomDelay(1000 * attempt, 3000 * attempt);
      }
    }

    throw new Error(`Failed to navigate to ${url} after ${this.options.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Detect if the page is blocked/showing CAPTCHA
   */
  protected async detectBlock(page: Page, statusCode: number): Promise<boolean> {
    if ([403, 429, 503].includes(statusCode)) return true;

    const bodyText = await page.evaluate(() => document.body?.innerText ?? '');
    const blockIndicators = [
      'captcha',
      'robot',
      'bot detected',
      'access denied',
      'rate limit',
      'just a moment',     // Cloudflare
      'verifikasi',        // Indonesian CAPTCHA pages
      'sedang diverifikasi',
    ];

    return blockIndicators.some(indicator =>
      bodyText.toLowerCase().includes(indicator),
    );
  }

  /**
   * Intercept XHR/fetch API calls to extract JSON directly.
   * Faster and more reliable than DOM scraping for some marketplaces.
   */
  protected async interceptApiRequests(page: Page, urlPattern: RegExp): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('API intercept timeout')), 20_000);

      page.on('response', async (response) => {
        if (urlPattern.test(response.url())) {
          try {
            const json = await response.json() as unknown;
            clearTimeout(timeout);
            resolve(json);
          } catch {
            // Not a JSON response, continue waiting
          }
        }
      });
    });
  }

  /**
   * Random delay to simulate human behavior
   */
  protected async randomDelay(minMs = 500, maxMs = 2000): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Safe text extract from page element
   */
  protected async getText(page: Page, selector: string): Promise<string> {
    try {
      return await page.$eval(selector, (el) => el.textContent?.trim() ?? '');
    } catch {
      return '';
    }
  }

  /**
   * Safe attribute extract from page element
   */
  protected async getAttribute(page: Page, selector: string, attr: string): Promise<string> {
    try {
      return await page.$eval(selector, (el, a) => el.getAttribute(a) ?? '', attr);
    } catch {
      return '';
    }
  }

  /**
   * Extract all matching texts
   */
  protected async getAllTexts(page: Page, selector: string): Promise<string[]> {
    try {
      return await page.$$eval(selector, (els) =>
        els.map(el => el.textContent?.trim() ?? '').filter(Boolean),
      );
    } catch {
      return [];
    }
  }
}
