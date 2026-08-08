import type { SearchResult, SearchResultItem, ProductDetail, ProductVariant, Review } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { BaseScraper } from './base.scraper.js';
import { normalizePrice, calcDiscount } from '../normalizers/price.normalizer.js';
import { normalizeStock } from '../normalizers/stock.normalizer.js';
import { normalizeRating, normalizeReviewCount, normalizeSoldCount, cleanReviewText } from '../normalizers/review.normalizer.js';
import { logger } from '../utils/logger.js';

export class TokopediaScraper extends BaseScraper {
  constructor(proxyRotator: ProxyRotator) {
    super('TOKOPEDIA', proxyRotator);
  }

  // ─────────────────────────────────────────────────────────
  //  SEARCH PRODUCTS
  // ─────────────────────────────────────────────────────────

  async searchProducts(keyword: string, options: {
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    perPage?: number;
  } = {}): Promise<SearchResult> {
    const { minPrice, maxPrice, page = 1 } = options;

    // Build Tokopedia search URL
    const params = new URLSearchParams({ q: keyword, page: String(page) });
    if (minPrice) params.set('pmin', String(minPrice));
    if (maxPrice) params.set('pmax', String(maxPrice));
    const url = `https://www.tokopedia.com/search?${params.toString()}`;

    logger.info({ keyword, marketplace: 'TOKOPEDIA', url }, 'Starting search scrape');

    const { page: browserPage, context } = await this.navigateWithRetry(url);

    try {
      // Wait for product cards to load
      await browserPage.waitForSelector('[data-testid="divSRPContentProducts"]', { timeout: 15_000 })
        .catch(() => browserPage.waitForSelector('.css-bk6tzz', { timeout: 10_000 })
          .catch(() => null));

      // Scroll to load lazy images
      await browserPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await this.randomDelay(1000, 2000);
      await browserPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.randomDelay(500, 1000);

      // Try to intercept API response first (faster & more reliable)
      // Tokopedia is a Next.js/GraphQL app — sometimes the data is in __NEXT_DATA__
      const nextData = await browserPage.evaluate(() => {
        const el = document.getElementById('__NEXT_DATA__');
        if (!el?.textContent) return null;
        try { return JSON.parse(el.textContent); } catch { return null; }
      }) as Record<string, unknown> | null;

      if (nextData) {
        return this.parseNextDataSearch(nextData, keyword, page);
      }

      // Fallback: DOM scraping
      return this.domSearchScrape(browserPage, keyword, page);

    } finally {
      await context.close();
    }
  }

  private parseNextDataSearch(data: Record<string, unknown>, keyword: string, page: number): SearchResult {
    // Tokopedia stores search results in props.pageProps.data.searchProductV5
    try {
      const props = data['props'] as Record<string, unknown> | undefined;
      const pageProps = props?.['pageProps'] as Record<string, unknown> | undefined;
      const searchData = pageProps?.['data'] as Record<string, unknown> | undefined;
      const products = (searchData?.['searchProductV5'] as Record<string, unknown> | undefined)?.['data'] as Record<string, unknown>[] | undefined;

      if (!products || !Array.isArray(products)) throw new Error('No products in __NEXT_DATA__');

      const items: SearchResultItem[] = products.slice(0, 20).map((p: Record<string, unknown>) => ({
        externalId: String(p['id'] ?? ''),
        marketplace: 'TOKOPEDIA' as const,
        url: String(p['url'] ?? ''),
        name: String(p['name'] ?? ''),
        price: normalizePrice(String(p['price'] ?? '0')),
        originalPrice: p['originalPrice'] ? normalizePrice(String(p['originalPrice'])) : undefined,
        discountPercent: Number(p['discountPercentage'] ?? 0),
        imageUrl: String(p['imageUrl'] ?? ''),
        rating: Number(p['rating'] ?? 0),
        totalReviews: normalizeReviewCount(String(p['countReview'] ?? '0')),
        totalSold: normalizeSoldCount(String(p['countSold'] ?? '0')),
        seller: { name: String(p['shop_name'] ?? ''), location: String(p['shop_location'] ?? '') },
        location: String(p['shop_location'] ?? ''),
      }));

      return { keyword, marketplace: 'TOKOPEDIA', totalFound: items.length, page, perPage: 20, items };
    } catch {
      logger.warn('Could not parse __NEXT_DATA__ for search, falling back to DOM');
      throw new Error('NextData parse failed');
    }
  }

  private async domSearchScrape(page: import('playwright').Page, keyword: string, pageNum: number): Promise<SearchResult> {
    const items: SearchResultItem[] = await page.$$eval(
      '[data-testid="divSRPContentProducts"] > div, .css-bk6tzz',
      (cards) => cards.slice(0, 20).map((card) => {
        const name = card.querySelector('[data-testid="linkProductName"], .prd_link-product-name')?.textContent?.trim() ?? '';
        const priceEl = card.querySelector('[data-testid="linkProductPrice"], .prd_link-product-price')?.textContent?.trim() ?? '0';
        const imageEl = card.querySelector('img');
        const linkEl = card.querySelector('a[href*="tokopedia.com"]');
        const ratingEl = card.querySelector('[data-testid="lblProductRating"]')?.textContent?.trim() ?? '0';
        const soldEl = card.querySelector('[data-testid="lblProductCountSold"]')?.textContent?.trim() ?? '';
        const shopEl = card.querySelector('[data-testid="lblProductShopName"]')?.textContent?.trim() ?? '';
        const locationEl = card.querySelector('[data-testid="lblProductShopLocation"]')?.textContent?.trim() ?? '';

        return { name, price: priceEl, imageUrl: imageEl?.src ?? '', url: linkEl?.getAttribute('href') ?? '', rating: ratingEl, sold: soldEl, shop: shopEl, location: locationEl };
      }),
    );

    const normalized: SearchResultItem[] = items.map((item, i) => ({
      externalId: `toped-dom-${pageNum}-${i}`,
      marketplace: 'TOKOPEDIA' as const,
      url: item['url'] as string,
      name: item['name'] as string,
      price: normalizePrice(item['price'] as string),
      imageUrl: item['imageUrl'] as string,
      rating: normalizeRating(item['rating'] as string),
      totalSold: normalizeSoldCount(item['sold'] as string),
      seller: { name: item['shop'] as string, location: item['location'] as string },
      location: item['location'] as string,
    }));

    return { keyword, marketplace: 'TOKOPEDIA', totalFound: normalized.length, page: pageNum, perPage: 20, items: normalized };
  }

  // ─────────────────────────────────────────────────────────
  //  PRODUCT DETAILS
  // ─────────────────────────────────────────────────────────

  async getProductDetails(url: string, includeReviews = false): Promise<ProductDetail> {
    logger.info({ url, marketplace: 'TOKOPEDIA' }, 'Starting product detail scrape');

    const { page, context } = await this.navigateWithRetry(url);

    try {
      // Wait for product name to appear
      await page.waitForSelector('[data-testid="lblPDPDetailProductName"], h1', { timeout: 15_000 });

      // Extract from __NEXT_DATA__ first
      const nextData = await page.evaluate(() => {
        const el = document.getElementById('__NEXT_DATA__');
        if (!el?.textContent) return null;
        try { return JSON.parse(el.textContent); } catch { return null; }
      }) as Record<string, unknown> | null;

      let productDetail: ProductDetail;

      if (nextData) {
        productDetail = await this.parseNextDataProduct(nextData, url);
      } else {
        productDetail = await this.domProductScrape(page, url);
      }

      if (includeReviews) {
        productDetail.reviews = await this.scrapeReviews(page, url);
      }

      return productDetail;

    } finally {
      await context.close();
    }
  }

  private async parseNextDataProduct(data: Record<string, unknown>, url: string): Promise<ProductDetail> {
    const props = data['props'] as Record<string, unknown> | undefined;
    const pageProps = props?.['pageProps'] as Record<string, unknown> | undefined;
    const pdpData = pageProps?.['data'] as Record<string, unknown> | undefined;
    const product = pdpData?.['pdpGetLayout'] as Record<string, unknown> | undefined;

    const basicInfo = product?.['basicInfo'] as Record<string, unknown> | undefined;
    const name = String(basicInfo?.['alias'] ?? basicInfo?.['name'] ?? '');
    const externalId = String(basicInfo?.['id'] ?? '');
    const category = (basicInfo?.['category'] as Record<string, unknown>)?.['name'] as string ?? '';

    // Extract components (Tokopedia uses component-based layout)
    const components = product?.['components'] as Record<string, unknown>[] ?? [];
    const priceComp = components.find((c: Record<string, unknown>) => c['name'] === 'product_detail_media_price');
    const stockComp = components.find((c: Record<string, unknown>) => c['name'] === 'product_content_main');
    const descComp = components.find((c: Record<string, unknown>) => c['name'] === 'product_detail');

    const priceData = (priceComp?.['data'] as Record<string, unknown>[])?.[0] ?? {};
    const price = normalizePrice(String((priceData as Record<string, unknown>)?.['price'] ?? '0'));
    const originalPrice = normalizePrice(String((priceData as Record<string, unknown>)?.['slashPrice'] ?? '0'));
    const discountPercent = calcDiscount(originalPrice, price);

    const description = String(((descComp?.['data'] as Record<string, unknown>[])?.[0] as Record<string, unknown>)?.['description'] ?? '');
    const stock = normalizeStock(String(((stockComp?.['data'] as Record<string, unknown>[])?.[0] as Record<string, unknown>)?.['stock'] ?? '0'));
    const rating = normalizeRating(String(basicInfo?.['rating'] ?? '0'));
    const totalReviews = normalizeReviewCount(String(basicInfo?.['countReview'] ?? '0'));
    const totalSold = normalizeSoldCount(String(basicInfo?.['countSold'] ?? '0'));

    const shopInfo = product?.['shopInfo'] as Record<string, unknown> | undefined;
    const shopBasic = shopInfo?.['shopCore'] as Record<string, unknown> | undefined;

    return {
      externalId,
      marketplace: 'TOKOPEDIA',
      url,
      name,
      description,
      category,
      price,
      originalPrice: originalPrice > 0 ? originalPrice : undefined,
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      imageUrl: '',
      images: [],
      rating,
      totalReviews,
      totalSold,
      seller: {
        name: String(shopBasic?.['name'] ?? ''),
        url: `https://www.tokopedia.com/${shopBasic?.['domain'] ?? ''}`,
        isOfficial: Boolean(shopBasic?.['isOfficial']),
      },
      variants: this.extractVariants(product ?? {}, price),
      reviews: [],
      minPrice: price,
      maxPrice: price,
      totalStock: stock,
      specifications: {},
      scrapedAt: new Date().toISOString(),
    };
  }

  private async domProductScrape(page: import('playwright').Page, url: string): Promise<ProductDetail> {
    const name = await this.getText(page, '[data-testid="lblPDPDetailProductName"], h1');
    const priceRaw = await this.getText(page, '[data-testid="lblPDPDetailProductPrice"]');
    const originalPriceRaw = await this.getText(page, '[data-testid="lblPDPDetailSlashedPrice"]');
    const description = await this.getText(page, '[data-testid="lblPDPDescriptionProduk"]');
    const stockRaw = await this.getText(page, '[data-testid="lblPDPDetailProductStock"]');
    const ratingRaw = await this.getText(page, '[data-testid="lblPDPDetailProductRatingNumber"]');
    const reviewCountRaw = await this.getText(page, '[data-testid="lblPDPDetailProductRatingCounter"]');
    const sellerName = await this.getText(page, '[data-testid="llbPDPFooterShopName"]');
    const imageUrl = await this.getAttribute(page, '[data-testid="PDPImageMain"] img, .image-carousel img', 'src');

    const price = normalizePrice(priceRaw);
    const originalPrice = normalizePrice(originalPriceRaw);
    const stock = normalizeStock(stockRaw);
    const rating = normalizeRating(ratingRaw);

    return {
      externalId: url.split('/').pop() ?? '',
      marketplace: 'TOKOPEDIA',
      url,
      name,
      description,
      imageUrl,
      images: [imageUrl].filter(Boolean),
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      discountPercent: calcDiscount(originalPrice, price),
      rating,
      totalReviews: normalizeReviewCount(reviewCountRaw),
      totalSold: 0,
      seller: { name: sellerName },
      variants: [],
      reviews: [],
      category: '',
      specifications: {},
      minPrice: price,
      maxPrice: price,
      totalStock: stock,
      scrapedAt: new Date().toISOString(),
    };
  }

  private extractVariants(product: Record<string, unknown>, defaultPrice: number): ProductVariant[] {
    try {
      const components = product['components'] as Record<string, unknown>[] ?? [];
      const varComp = components.find((c: Record<string, unknown>) => c['name'] === 'product_detail_variant');
      const variants = (varComp?.['data'] as Record<string, unknown>[])?.[0] ?? {};
      const children = (variants as Record<string, unknown>)?.['children'] as Record<string, unknown>[] ?? [];

      return children.map((v: Record<string, unknown>) => ({
        name: String(v['text'] ?? ''),
        price: normalizePrice(String(v['price'] ?? defaultPrice)),
        originalPrice: v['priceBefore'] ? normalizePrice(String(v['priceBefore'])) : undefined,
        stock: normalizeStock(String(v['stock'] ?? '0')),
        imageUrl: String(v['picture']?.['url70'] ?? ''),
      }));
    } catch {
      return [];
    }
  }

  private async scrapeReviews(page: import('playwright').Page, _url: string): Promise<Review[]> {
    try {
      await page.click('[data-testid="lblSellerReviewAll"]').catch(() => {});
      await this.randomDelay(1000, 2000);

      const reviews = await page.$$eval('[data-testid="divReviewList"] > div', (cards) =>
        cards.slice(0, 10).map((card) => ({
          author: card.querySelector('[data-testid="lblSRUserName"]')?.textContent?.trim() ?? '',
          rating: (card.querySelectorAll('[data-testid="star-icon-filled"]').length) || 5,
          content: card.querySelector('[data-testid="lblSRDescription"]')?.textContent?.trim() ?? '',
          reviewDate: card.querySelector('[data-testid="lblSRDate"]')?.textContent?.trim() ?? '',
        })),
      );

      return reviews.map(r => ({
        author: r.author,
        rating: r.rating,
        content: cleanReviewText(r.content),
        reviewDate: r.reviewDate ? new Date(r.reviewDate).toISOString() : undefined,
      }));
    } catch {
      return [];
    }
  }
}
