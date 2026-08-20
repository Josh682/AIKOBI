import type { Job } from 'bullmq';
import type { CollectionProductJobPayload } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { TokopediaScraper } from '../scrapers/tokopedia.scraper.js';
import { ShopeeScraper } from '../scrapers/shopee.scraper.js';
import { prisma } from '@datascrapper/db';
import { Decimal } from '@prisma/client/runtime/library';
import { trackProductPrice } from '../utils/price-tracker.js';
import { logger } from '../utils/logger.js';

/**
 * Processor untuk collection-product queue.
 *
 * Flow:
 * 1. Ambil payload (sessionId, url, marketplace, trackPriceChange)
 * 2. Jalankan scraper getProductDetails()
 * 3. Upsert Product + variants ke DB
 * 4. Hitung delta harga vs PriceHistory terakhir
 * 5. Simpan PriceHistory entry dengan field priceChange + changePercent
 * 6. Update CollectionSession stats
 */
export async function processCollectionProductJob(
  job: Job<CollectionProductJobPayload>,
  proxyRotator: ProxyRotator,
): Promise<void> {
  const { sessionId, planId, marketplace, url, trackPriceChange } = job.data;

  logger.info(
    { sessionId, planId, marketplace, url },
    '📦 [Collection] Processing product job',
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

    // ── Scrape detail produk ──────────────────────────────────
    const detail = await scraper.getProductDetails(url, false); // reviews tidak perlu untuk price tracking

    // ── Upsert produk ke DB ───────────────────────────────────
    const product = await prisma.product.upsert({
      where: { url },
      create: {
        marketplace,
        externalId: detail.externalId,
        url,
        name: detail.name,
        description: detail.description,
        imageUrl: detail.imageUrl,
        seller: detail.seller?.name,
        sellerUrl: detail.seller?.url,
        isOfficialStore: detail.seller?.isOfficial ?? false,
        location: detail.location,
        category: detail.category,
        rating: detail.rating != null ? new Decimal(detail.rating) : null,
        totalReviews: detail.totalReviews,
        totalSold: detail.totalSold,
        rawData: JSON.parse(JSON.stringify(detail)),
        lastScrapedAt: new Date(),
      },
      update: {
        name: detail.name,
        description: detail.description,
        imageUrl: detail.imageUrl,
        seller: detail.seller?.name,
        rating: detail.rating != null ? new Decimal(detail.rating) : null,
        totalReviews: detail.totalReviews,
        totalSold: detail.totalSold,
        rawData: JSON.parse(JSON.stringify(detail)),
        lastScrapedAt: new Date(),
      },
    });

    // ── Upsert variants ───────────────────────────────────────
    if (detail.variants.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.createMany({
        data: detail.variants.map((v: { name: string; price: number; originalPrice?: number | null; discountPercent?: number | null; stock?: number | null; sku?: string | null; imageUrl?: string | null }) => ({
          productId: product.id,
          name: v.name,
          price: new Decimal(v.price),
          originalPrice: v.originalPrice != null ? new Decimal(v.originalPrice) : null,
          discountPercent: v.discountPercent ?? null,
          stock: v.stock ?? undefined,
          sku: v.sku ?? undefined,
          imageUrl: v.imageUrl ?? undefined,
        })),
      });
    }

    // ── Track harga + deteksi perubahan ───────────────────────
    let hasSignificantChange = false;
    let changePercent: number | null = null;

    if (trackPriceChange) {
      const result = await trackProductPrice({
        productId: product.id,
        newPrice: detail.price,
        priceDisc: detail.discountPercent && detail.discountPercent > 0
          ? detail.price
          : undefined,
        sessionId,
        significantThreshold: 1, // 1% threshold
      });
      hasSignificantChange = result.hasSignificantChange;
      changePercent = result.changePercent;
    } else {
      // Tetap simpan snapshot harga meski tidak tracking delta
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: new Decimal(detail.price),
          priceDisc: detail.discountPercent && detail.discountPercent > 0
            ? new Decimal(detail.price)
            : null,
          sessionId,
        },
      });
    }

    // ── Update session stats ──────────────────────────────────
    await prisma.collectionSession.update({
      where: { id: sessionId },
      data: {
        completedJobs: { increment: 1 },
        productsFound: { increment: 1 },
        priceChanges: { increment: hasSignificantChange ? 1 : 0 },
      },
    });

    // ── Log ke CollectionLog ──────────────────────────────────
    const logMsg = hasSignificantChange
      ? `Perubahan harga ${changePercent !== null && changePercent > 0 ? '+' : ''}${changePercent?.toFixed(2)}% pada "${detail.name}"`
      : `Harga stabil untuk "${detail.name}" (Rp ${detail.price.toLocaleString('id-ID')})`;

    await prisma.collectionLog.create({
      data: {
        sessionId,
        level: hasSignificantChange ? 'WARN' : 'INFO',
        message: logMsg,
        metadata: {
          productId: product.id,
          url,
          price: detail.price,
          changePercent,
          hasSignificantChange,
        },
      },
    });

    logger.info(
      { sessionId, productId: product.id, name: detail.name, price: detail.price, hasSignificantChange },
      '✅ [Collection] Product job completed',
    );

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ sessionId, planId, url, error: msg }, '❌ [Collection] Product job failed');

    await prisma.collectionSession.update({
      where: { id: sessionId },
      data: { failedJobs: { increment: 1 } },
    }).catch(() => {});

    await prisma.collectionLog.create({
      data: {
        sessionId,
        level: 'ERROR',
        message: `Gagal scrape produk ${url}: ${msg}`,
        metadata: { url, error: msg },
      },
    }).catch(() => {});

    throw error;
  }
}
