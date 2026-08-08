import type { Job } from 'bullmq';
import type { SearchJobPayload, SearchResult } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { TokopediaScraper } from '../scrapers/tokopedia.scraper.js';
import { ShopeeScraper } from '../scrapers/shopee.scraper.js';
import { prisma } from '@datascrapper/db';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '../utils/logger.js';

// ── Mock data generator (dev mode fallback) ──────────────────
function generateMockResults(keyword: string, marketplace: string, page: number): SearchResult {
  const items = Array.from({ length: 10 }, (_, i) => ({
    externalId: `mock-${marketplace}-${page}-${i}`,
    marketplace: marketplace as SearchResult['marketplace'],
    url: `https://www.${marketplace.toLowerCase()}.com/product/mock-${i}`,
    name: `[MOCK] ${keyword} - Product ${i + 1} (${marketplace})`,
    price: Math.floor(Math.random() * 5_000_000) + 100_000,
    originalPrice: Math.floor(Math.random() * 7_000_000) + 200_000,
    discountPercent: Math.floor(Math.random() * 40),
    imageUrl: `https://picsum.photos/seed/${i}/300/300`,
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    totalReviews: Math.floor(Math.random() * 500),
    totalSold: Math.floor(Math.random() * 2000),
    seller: { name: `Toko Mock ${i + 1}`, location: 'Jakarta' },
    location: 'Jakarta',
  }));
  return { keyword, marketplace: marketplace as SearchResult['marketplace'], totalFound: 100, page, perPage: 10, items };
}

/**
 * Process a search scraping job.
 * 1. Pick the right scraper for the marketplace
 * 2. Run the scrape
 * 3. Save results to DB (SearchCache)
 * 4. Update task status
 */
export async function processSearchJob(
  job: Job<SearchJobPayload>,
  proxyRotator: ProxyRotator,
): Promise<void> {
  const { taskId, marketplace, keyword, minPrice, maxPrice, page, perPage } = job.data;

  logger.info({ taskId, marketplace, keyword }, '🔍 Processing search job');

  // Mark task as processing
  await prisma.scrapeTask.update({
    where: { id: taskId },
    data: { status: 'PROCESSING', startedAt: new Date() },
  });

  try {
    // Select the right scraper
    let scraper: TokopediaScraper | ShopeeScraper;
    switch (marketplace) {
      case 'TOKOPEDIA':
        scraper = new TokopediaScraper(proxyRotator);
        break;
      case 'SHOPEE':
        scraper = new ShopeeScraper(proxyRotator);
        break;
      default:
        throw new Error(`Marketplace ${marketplace} not yet supported`);
    }

    // Perform the scrape
    const result = await scraper.searchProducts(keyword, {
      minPrice,
      maxPrice,
      page: page ?? 1,
      perPage: perPage ?? 20,
    });

    // Calculate cache expiry (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save to SearchCache DB
    await prisma.searchCache.upsert({
      where: {
        marketplace_keyword_minPrice_maxPrice_page: {
          marketplace,
          keyword: keyword.toLowerCase(),
          minPrice: minPrice != null ? new Decimal(minPrice) : null,
          maxPrice: maxPrice != null ? new Decimal(maxPrice) : null,
          page: page ?? 1,
        },
      },
      create: {
        marketplace,
        keyword: keyword.toLowerCase(),
        minPrice: minPrice != null ? new Decimal(minPrice) : null,
        maxPrice: maxPrice != null ? new Decimal(maxPrice) : null,
        page: page ?? 1,
        resultData: JSON.parse(JSON.stringify(result)) as any,
        resultCount: result.items.length,
        expiresAt,
      },
      update: {
        resultData: JSON.parse(JSON.stringify(result)) as any,
        resultCount: result.items.length,
        expiresAt,
      },
    });

    // Mark task as completed
    await prisma.scrapeTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    logger.info({ taskId, itemCount: result.items.length }, '✅ Search job completed');

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ taskId, error: msg }, '❌ Search job failed');

    // ── Dev mode: fallback to mock data instead of failing ──
    if (process.env.NODE_ENV !== 'production') {
      logger.warn({ taskId }, '⚠️  DEV MODE: returning mock data (real scraping failed)');
      const mockResult = generateMockResults(keyword, marketplace, page ?? 1);

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await prisma.searchCache.upsert({
        where: {
          marketplace_keyword_minPrice_maxPrice_page: {
            marketplace,
            keyword: keyword.toLowerCase(),
            minPrice: minPrice != null ? new Decimal(minPrice) : null,
            maxPrice: maxPrice != null ? new Decimal(maxPrice) : null,
            page: page ?? 1,
          },
        },
        create: {
          marketplace,
          keyword: keyword.toLowerCase(),
          minPrice: minPrice != null ? new Decimal(minPrice) : null,
          maxPrice: maxPrice != null ? new Decimal(maxPrice) : null,
          page: page ?? 1,
          resultData: JSON.parse(JSON.stringify(mockResult)) as any,
          resultCount: mockResult.items.length,
          expiresAt,
        },
        update: {
          resultData: JSON.parse(JSON.stringify(mockResult)) as any,
          resultCount: mockResult.items.length,
          expiresAt,
        },
      });

      await prisma.scrapeTask.update({
        where: { id: taskId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      logger.info({ taskId, itemCount: mockResult.items.length }, '✅ Mock search job completed');
      return; // don't rethrow — task is "done"
    }

    await prisma.scrapeTask.update({
      where: { id: taskId },
      data: { status: 'FAILED', errorMessage: msg, completedAt: new Date(), retryCount: { increment: 1 } },
    });
    throw error;
  }
}
