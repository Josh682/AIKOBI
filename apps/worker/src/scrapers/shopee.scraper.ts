import type { SearchResult, SearchResultItem, ProductDetail, ProductVariant, Review } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { BaseScraper } from './base.scraper.js';
import { normalizePrice, calcDiscount } from '../normalizers/price.normalizer.js';
import { normalizeStock } from '../normalizers/stock.normalizer.js';
import { normalizeRating, normalizeReviewCount, normalizeSoldCount, cleanReviewText } from '../normalizers/review.normalizer.js';
import { logger } from '../utils/logger.js';

export class ShopeeScraper extends BaseScraper {
  // Shopee's internal API base URL
  private readonly API_BASE = 'https://shopee.co.id/api/v4';

  constructor(proxyRotator: ProxyRotator) {
    super('SHOPEE', proxyRotator);
  }

  // ─────────────────────────────────────────────────────────
  //  SEARCH PRODUCTS
  //  Shopee exposes internal APIs loaded via XHR — we intercept them
  // ─────────────────────────────────────────────────────────

  async searchProducts(keyword: string, options: {
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    perPage?: number;
  } = {}): Promise<SearchResult> {
    const { minPrice, maxPrice, page = 1, perPage = 20 } = options;
    const offset = (page - 1) * perPage;

    // Shopee search URL
    const params = new URLSearchParams({ keyword });
    if (minPrice) params.set('price_min', String(minPrice));
    if (maxPrice) params.set('price_max', String(maxPrice));
    const url = `https://shopee.co.id/search?${params.toString()}`;

    logger.info({ keyword, marketplace: 'SHOPEE', url }, 'Starting Shopee search');

    const { page: browserPage, context } = await this.navigateWithRetry(url);

    try {
      // Intercept the internal Shopee search API call
      const apiPattern = /shopee\.co\.id\/api\/v4\/search\/search_items/;
      let apiData: Record<string, unknown> | null = null;

      // Set up intercept before scroll (API fires on load)
      const interceptPromise = this.interceptApiRequests(browserPage, apiPattern)
        .then(data => { apiData = data as Record<string, unknown>; })
        .catch(() => {});

      // Trigger lazy load by scrolling
      await browserPage.waitForLoadState('networkidle').catch(() => {});
      await browserPage.evaluate(() => window.scrollTo(0, 500));
      await this.randomDelay(2000, 3000);

      // Wait for intercept to complete
      await interceptPromise;

      if (apiData) {
        return this.parseShopeeSearchApi(apiData, keyword, page, perPage);
      }

      // Fallback to direct API call using page's fetch (inherits cookies/headers)
      const directData = await browserPage.evaluate(async (params) => {
        const resp = await fetch(
          `https://shopee.co.id/api/v4/search/search_items?by=relevancy&keyword=${encodeURIComponent(params.keyword)}&limit=${params.perPage}&newest=${params.offset}&order=desc&page_type=search`,
          { credentials: 'include' }
        );
        return resp.json();
      }, { keyword, perPage, offset }) as Record<string, unknown> | null;

      if (directData) {
        return this.parseShopeeSearchApi(directData, keyword, page, perPage);
      }

      // Last resort: DOM scraping
      return this.domSearchScrape(browserPage, keyword, page);

    } finally {
      await context.close();
    }
  }

  private parseShopeeSearchApi(data: Record<string, unknown>, keyword: string, page: number, perPage: number): SearchResult {
    const items = ((data['items'] ?? data['item_list']) as Record<string, unknown>[] | undefined) ?? [];

    const normalized: SearchResultItem[] = items.map((item: Record<string, unknown>) => {
      const info = (item['item_basic'] ?? item) as Record<string, unknown>;
      const shopId = String(info['shopid'] ?? '');
      const itemId = String(info['itemid'] ?? info['id'] ?? '');
      const price = normalizePrice(Number(info['price']) / 100000); // Shopee stores price * 100000
      const originalPrice = info['price_before_discount']
        ? normalizePrice(Number(info['price_before_discount']) / 100000)
        : undefined;

      return {
        externalId: `${shopId}_${itemId}`,
        marketplace: 'SHOPEE' as const,
        url: `https://shopee.co.id/${String(info['name'] ?? '').replace(/\s+/g, '-').toLowerCase()}-i.${shopId}.${itemId}`,
        name: String(info['name'] ?? ''),
        price,
        originalPrice,
        discountPercent: info['discount'] ? Number(info['discount']) : calcDiscount(originalPrice ?? 0, price),
        imageUrl: info['image'] ? `https://down-id.img.susercontent.com/file/${info['image']}` : '',
        rating: Number((info['item_rating'] as Record<string, unknown> | undefined)?.['rating_star'] ?? info['rating_star'] ?? 0),
        totalReviews: normalizeReviewCount(String(((info['item_rating'] as Record<string, unknown> | undefined)?.['rating_count'] as unknown[] | undefined)?.[0] ?? 0)),
        totalSold: normalizeSoldCount(String(info['sold'] ?? info['historical_sold'] ?? 0)),
        seller: {
          name: String(info['shop_name'] ?? ''),
          location: String(info['shop_location'] ?? ''),
        },
        location: String(info['shop_location'] ?? ''),
        badge: info['is_official_shop'] ? 'Official Store' : undefined,
      };
    });

    return { keyword, marketplace: 'SHOPEE', totalFound: normalized.length, page, perPage, items: normalized };
  }

  private async domSearchScrape(page: import('playwright').Page, keyword: string, pageNum: number): Promise<SearchResult> {
    await page.waitForSelector('.shopee-search-item-result__items', { timeout: 15_000 }).catch(() => null);

    const items = await page.$$eval(
      '.shopee-search-item-result__items > .col-xs-2-4',
      (cards) => cards.slice(0, 20).map((card) => ({
        name: card.querySelector('._1NoI8_')?.textContent?.trim() ?? '',
        price: card.querySelector('._3c5u7T span')?.textContent?.trim() ?? '0',
        imageUrl: (card.querySelector('img') as HTMLImageElement)?.src ?? '',
        url: (card.querySelector('a') as HTMLAnchorElement)?.href ?? '',
        rating: card.querySelector('.shopee-rating-stars__stars span')?.textContent?.trim() ?? '0',
        sold: card.querySelector('._18sp3K')?.textContent?.trim() ?? '0',
        location: card.querySelector('.zGGwiV')?.textContent?.trim() ?? '',
      })),
    );

    return {
      keyword,
      marketplace: 'SHOPEE',
      totalFound: items.length,
      page: pageNum,
      perPage: 20,
      items: items.map((item, i) => ({
        externalId: `shopee-dom-${pageNum}-${i}`,
        marketplace: 'SHOPEE' as const,
        url: item.url,
        name: item.name,
        price: normalizePrice(item.price),
        imageUrl: item.imageUrl,
        rating: normalizeRating(item.rating),
        totalSold: normalizeSoldCount(item.sold),
        location: item.location,
        seller: { name: '', location: item.location },
      })),
    };
  }

  // ─────────────────────────────────────────────────────────
  //  PRODUCT DETAILS
  // ─────────────────────────────────────────────────────────

  async getProductDetails(url: string, includeReviews = false): Promise<ProductDetail> {
    logger.info({ url, marketplace: 'SHOPEE' }, 'Starting Shopee product detail scrape');

    // Extract shopId and itemId from URL: .../i.{shopId}.{itemId}
    const match = url.match(/i\.(\d+)\.(\d+)/);
    const shopId = match?.[1];
    const itemId = match?.[2];

    const { page, context } = await this.navigateWithRetry(url);

    try {
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

      // Try direct API call if we have IDs
      if (shopId && itemId) {
        const apiData = await page.evaluate(async (params) => {
          const resp = await fetch(
            `https://shopee.co.id/api/v4/item/get?itemid=${params.itemId}&shopid=${params.shopId}`,
            { credentials: 'include' }
          );
          return resp.json();
        }, { shopId, itemId }) as Record<string, unknown> | null;

        if (apiData?.['data']) {
          const product = await this.parseShopeeProductApi(apiData['data'] as Record<string, unknown>, url);
          if (includeReviews) {
            product.reviews = await this.scrapeReviews(page, shopId, itemId);
          }
          return product;
        }
      }

      // Fallback: DOM scraping
      return this.domProductScrape(page, url);

    } finally {
      await context.close();
    }
  }

  private async parseShopeeProductApi(item: Record<string, unknown>, url: string): Promise<ProductDetail> {
    const price = normalizePrice(Number(item['price']) / 100000);
    const originalPrice = item['price_before_discount']
      ? normalizePrice(Number(item['price_before_discount']) / 100000)
      : undefined;
    const minPrice = normalizePrice(Number(item['price_min']) / 100000);
    const maxPrice = normalizePrice(Number(item['price_max']) / 100000);

    const images = ((item['images'] as string[] | undefined) ?? []).map(
      (img: string) => `https://down-id.img.susercontent.com/file/${img}`,
    );

    // Extract variants (models)
    const models = (item['models'] as Record<string, unknown>[] | undefined) ?? [];
    const variantNames = ((item['tier_variations'] as Record<string, unknown>[] | undefined) ?? [])
      .map((v: Record<string, unknown>) => String(v['name'] ?? ''));

    const variants: ProductVariant[] = models.map((model: Record<string, unknown>) => ({
      name: ((model['extinfo'] as Record<string, unknown>)?.['tier_index'] as number[] | undefined)
        ?.map((idx: number, i: number) => {
          const variation = (item['tier_variations'] as Record<string, unknown>[] | undefined)?.[i];
          const options = (variation?.['options'] as string[] | undefined);
          return options?.[idx] ?? '';
        })
        .filter(Boolean)
        .join(' - ') ?? variantNames.join(' - '),
      price: normalizePrice(Number(model['price']) / 100000),
      originalPrice: model['price_before_discount']
        ? normalizePrice(Number(model['price_before_discount']) / 100000)
        : undefined,
      stock: Number(model['stock'] ?? 0),
      sku: String(model['model_id'] ?? ''),
    }));

    const specs: Record<string, string> = {};
    const attributes = (item['attributes'] as Record<string, unknown>[] | undefined) ?? [];
    for (const attr of attributes) {
      const key = String(attr['name'] ?? '');
      const val = String((attr['value'] as Record<string, unknown>)?.['value'] ?? attr['value'] ?? '');
      if (key && val) specs[key] = val;
    }

    return {
      externalId: `${item['shopid']}_${item['itemid']}`,
      marketplace: 'SHOPEE',
      url,
      name: String(item['name'] ?? ''),
      description: String((item['description'] ?? '')).substring(0, 5000),
      imageUrl: images[0] ?? '',
      images,
      price,
      originalPrice,
      discountPercent: originalPrice ? calcDiscount(originalPrice, price) : 0,
      rating: Number((item['item_rating'] as Record<string, unknown> | undefined)?.['rating_star'] ?? 0),
      totalReviews: normalizeReviewCount(String(((item['item_rating'] as Record<string, unknown> | undefined)?.['rating_count'] as unknown[] | undefined)?.[0] ?? 0)),
      totalSold: normalizeSoldCount(String(item['historical_sold'] ?? 0)),
      seller: {
        name: String(item['shop_name'] ?? ''),
        isOfficial: Boolean(item['is_official_shop']),
        location: String(item['shop_location'] ?? ''),
      },
      category: String(((item['categories'] as Record<string, unknown>[] | undefined)?.[0] as Record<string, unknown> | undefined)?.['display_name'] ?? ''),
      variants,
      reviews: [],
      specifications: specs,
      minPrice,
      maxPrice,
      totalStock: variants.reduce((sum: number, v) => sum + v.stock, 0) || Number(item['stock'] ?? 0),
      scrapedAt: new Date().toISOString(),
    };
  }

  private async domProductScrape(page: import('playwright').Page, url: string): Promise<ProductDetail> {
    await page.waitForSelector('._3-J3K._2GnJrU', { timeout: 15_000 }).catch(() => null);

    const name = await this.getText(page, 'h1._3-J3K._2GnJrU, ._4rR21T');
    const priceRaw = await this.getText(page, '._3n5NQx, .pqTWkA');
    const originalPriceRaw = await this.getText(page, '._3HkZoQ');
    const stockRaw = await this.getText(page, '._6uN7R span');
    const ratingRaw = await this.getText(page, '._3Oj5_n._2z6cUg');
    const reviewRaw = await this.getText(page, '._3Oj5_n:last-child');
    const description = await this.getText(page, '._2u0jt9');
    const sellerName = await this.getText(page, '.seller-name .shopee-link__content');
    const imageUrl = await this.getAttribute(page, '._2sMbFG img', 'src');

    const price = normalizePrice(priceRaw);
    const originalPrice = normalizePrice(originalPriceRaw);

    return {
      externalId: url.match(/i\.(\d+\.\d+)/)?.[1] ?? '',
      marketplace: 'SHOPEE',
      url,
      name,
      description,
      imageUrl,
      images: [imageUrl].filter(Boolean),
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      discountPercent: calcDiscount(originalPrice, price),
      rating: normalizeRating(ratingRaw),
      totalReviews: normalizeReviewCount(reviewRaw),
      totalSold: 0,
      seller: { name: sellerName },
      category: '',
      variants: [],
      reviews: [],
      specifications: {},
      minPrice: price,
      maxPrice: price,
      totalStock: normalizeStock(stockRaw),
      scrapedAt: new Date().toISOString(),
    };
  }

  private async scrapeReviews(page: import('playwright').Page, shopId: string, itemId: string): Promise<Review[]> {
    try {
      const data = await page.evaluate(async (params) => {
        const resp = await fetch(
          `https://shopee.co.id/api/v2/item/get_ratings?filter=0&flag=1&itemid=${params.itemId}&limit=10&offset=0&shopid=${params.shopId}&type=0`,
          { credentials: 'include' }
        );
        return resp.json();
      }, { shopId, itemId }) as Record<string, unknown> | null;

      const dataObj = data?.['data'] as Record<string, unknown> | undefined;
      const ratings = (dataObj?.['ratings'] as Record<string, unknown>[] | undefined) ?? [];
      return ratings.map((r: Record<string, unknown>) => ({
        author: String(r['author_username'] ?? ''),
        rating: Number(r['rating_star'] ?? 5),
        content: cleanReviewText(String(r['comment'] ?? '')),
        reviewDate: r['ctime'] ? new Date(Number(r['ctime']) * 1000).toISOString() : undefined,
      }));
    } catch {
      return [];
    }
  }
}
