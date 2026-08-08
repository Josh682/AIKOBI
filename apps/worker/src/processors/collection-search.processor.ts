import type { Job } from 'bullmq';
import { Queue } from 'bullmq';
import { Redis as IORedis } from 'ioredis';
import type { CollectionSearchJobPayload } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { TokopediaScraper } from '../scrapers/tokopedia.scraper.js';
import { ShopeeScraper } from '../scrapers/shopee.scraper.js';
import { prisma } from '@datascrapper/db';
import { Decimal } from '@prisma/client/runtime/library';
import { trackProductPrice } from '../utils/price-tracker.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// ── Mock data generator (dev mode fallback) ──────────────────
function generateMockSearchItems(keyword: string, marketplace: string, page: number) {
  return Array.from({ length: 10 }, (_, i) => ({
    externalId: `mock-col-${marketplace}-${page}-${i}`,
    marketplace,
    url: `https://www.${marketplace.toLowerCase()}.com/product/mock-collection-${Date.now()}-${i}`,
    name: `[MOCK] ${keyword} - Product ${(page - 1) * 10 + i + 1} (${marketplace})`,
    price: Math.floor(Math.random() * 5_000_000) + 100_000,
    originalPrice: Math.floor(Math.random() * 7_000_000) + 200_000,
    discountPercent: Math.floor(Math.random() * 40),
    imageUrl: `https://picsum.photos/seed/col${i}/300/300`,
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    totalReviews: Math.floor(Math.random() * 500),
    totalSold: Math.floor(Math.random() * 2000),
    seller: { name: `Toko Mock ${i + 1}`, location: 'Jakarta' },
    location: 'Jakarta',
  }));
}

/**
 * Processor untuk collection-search queue.
 *
 * Flow:
 * 1. Ambil payload (sessionId, keyword, page, maxPages, marketplace)
 * 2. Jalankan scraper sesuai marketplace
 * 3. Upsert setiap produk yang ditemukan ke tabel Product
 * 4. Catat PriceHistory + hitung delta harga (price tracking)
 * 5. Update CollectionSession stats
 * 6. Jika masih ada halaman berikutnya, enqueue job page+1 ke queue yang sama
 *
 * Dev Mode: jika scraping gagal (anti-bot, timeout, dll),
 * otomatis fallback ke mock data agar flow tetap bisa ditest end-to-end.
 */
export async function processCollectionSearchJob(
  job: Job<CollectionSearchJobPayload>,
  proxyRotator: ProxyRotator,
): Promise<void> {
  const { sessionId, planId, marketplace, keyword, minPrice, maxPrice, page, maxPages } = job.data;

  logger.info(
    { sessionId, planId, marketplace, keyword, page, maxPages },
    '🔍 [Collection] Processing search job',
  );

  try {
    // ── Pilih scraper sesuai marketplace ─────────────────────
    let scraper: TokopediaScraper | ShopeeScraper;
    switch (marketplace) {
      case 'TOKOPEDIA':
        scraper = new TokopediaScraper(proxyRotator);
        break;
      case 'SHOPEE':
        scraper = new ShopeeScraper(proxyRotator);
        break;
      default:
        throw new Error(`Marketplace ${marketplace} belum didukung di collection`);
    }

    // ── Jalankan scraping ─────────────────────────────────────
    const result = await scraper.searchProducts(keyword, {
      minPrice,
      maxPrice,
      page,
      perPage: 20,
    });

    logger.info(
      { sessionId, keyword, page, itemCount: result.items.length },
      `✅ [Collection] Search page ${page} scraped`,
    );

    await processItems(result.items, { sessionId, planId, marketplace, keyword, page, maxPages, job });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ sessionId, planId, keyword, page, error: msg }, '❌ [Collection] Search job failed');

    // ── Dev mode: fallback ke mock data ──────────────────────
    if (process.env.NODE_ENV !== 'production') {
      logger.warn(
        { sessionId, keyword },
        '⚠️  DEV MODE: Scraping gagal, menggunakan mock data untuk testing',
      );

      const mockItems = generateMockSearchItems(keyword, marketplace, page);
      await processItems(mockItems, { sessionId, planId, marketplace, keyword, page, maxPages, job });

      logger.info(
        { sessionId, keyword, mockCount: mockItems.length },
        '✅ [Collection] Mock data berhasil disimpan ke database',
      );
      return; // Jangan throw — anggap berhasil dengan mock data
    }

    // Production: update session sebagai failed
    await prisma.collectionSession.update({
      where: { id: sessionId },
      data: { failedJobs: { increment: 1 } },
    }).catch(() => {});

    await prisma.collectionLog.create({
      data: {
        sessionId,
        level: 'ERROR',
        message: `Search page ${page} gagal: ${msg}`,
        metadata: { keyword, page, error: msg },
      },
    }).catch(() => {});

    throw error;
  }
}

/**
 * Helper: Proses item-item hasil scraping (real maupun mock)
 * — upsert ke Product, track harga, update session stats, enqueue next page
 */
async function processItems(
  items: Array<{
    externalId: string;
    url: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    seller?: { name: string; location?: string } | null;
    location?: string;
    rating?: number | null;
    totalReviews?: number;
    totalSold?: number;
  }>,
  ctx: {
    sessionId: string;
    planId: string;
    marketplace: string;
    keyword: string;
    page: number;
    maxPages: number;
    job: Job<CollectionSearchJobPayload>;
  },
): Promise<void> {
  const { sessionId, planId, marketplace, keyword, page, maxPages, job } = ctx;

  let productsFound = 0;
  let priceChanges = 0;

  for (const item of items) {
    try {
      const product = await prisma.product.upsert({
        where: {
          marketplace_externalId: {
            marketplace: marketplace as 'TOKOPEDIA' | 'SHOPEE' | 'BUKALAPAK' | 'LAZADA' | 'BLIBLI',
            externalId: item.externalId,
          },
        },
        create: {
          marketplace: marketplace as 'TOKOPEDIA' | 'SHOPEE' | 'BUKALAPAK' | 'LAZADA' | 'BLIBLI',
          externalId: item.externalId,
          url: item.url,
          name: item.name,
          imageUrl: item.imageUrl,
          seller: item.seller?.name,
          location: item.location,
          rating: item.rating != null ? new Decimal(item.rating) : null,
          totalReviews: item.totalReviews,
          totalSold: item.totalSold,
          lastScrapedAt: new Date(),
        },
        update: {
          url: item.url,
          name: item.name,
          imageUrl: item.imageUrl,
          rating: item.rating != null ? new Decimal(item.rating) : null,
          totalReviews: item.totalReviews,
          totalSold: item.totalSold,
          lastScrapedAt: new Date(),
        },
      });

      const { hasSignificantChange } = await trackProductPrice({
        productId: product.id,
        newPrice: item.price,
        priceDisc: item.originalPrice && item.originalPrice > item.price
          ? item.price
          : undefined,
        sessionId,
      });

      productsFound++;
      if (hasSignificantChange) priceChanges++;

    } catch (itemError) {
      const msg = itemError instanceof Error ? itemError.message : String(itemError);
      logger.warn({ sessionId, url: item.url, error: msg }, '⚠️ [Collection] Failed to upsert product');
    }
  }

  // ── Update session stats ──────────────────────────────────
  await prisma.collectionSession.update({
    where: { id: sessionId },
    data: {
      completedJobs: { increment: 1 },
      productsFound: { increment: productsFound },
      priceChanges: { increment: priceChanges },
    },
  });

  // ── Log ke CollectionLog ──────────────────────────────────
  await prisma.collectionLog.create({
    data: {
      sessionId,
      level: 'INFO',
      message: `Page ${page}/${maxPages} selesai: ${productsFound} produk ditemukan, ${priceChanges} perubahan harga`,
      metadata: { keyword, page, maxPages, productsFound, priceChanges },
    },
  });

  // ── Enqueue halaman berikutnya jika ada ──────────────────
  if (page < maxPages && items.length > 0) {
    const redis = new IORedis(env.REDIS_URL, {
      password: env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    const nextPageQueue = new Queue<CollectionSearchJobPayload>('collection-search', {
      connection: redis,
    });

    await nextPageQueue.add(
      `${planId}-page-${page + 1}`,
      { ...job.data, page: page + 1 },
      {
        delay: 3000 + Math.floor(Math.random() * 2000),
      },
    );

    await nextPageQueue.close();
    await redis.quit();

    logger.info({ sessionId, nextPage: page + 1 }, '📢 [Collection] Next page enqueued');
  }
}
