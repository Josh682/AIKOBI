import type { Job } from 'bullmq';
import type { ProductDetailJobPayload } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { TokopediaScraper } from '../scrapers/tokopedia.scraper.js';
import { ShopeeScraper } from '../scrapers/shopee.scraper.js';
import { prisma } from '@datascrapper/db';
import { logger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';

export async function processProductJob(
  job: Job<ProductDetailJobPayload>,
  proxyRotator: ProxyRotator,
): Promise<void> {
  const { taskId, marketplace, url, includeReviews } = job.data;

  logger.info({ taskId, marketplace, url }, '📦 Processing product detail job');

  await prisma.scrapeTask.update({
    where: { id: taskId },
    data: { status: 'PROCESSING', startedAt: new Date() },
  });

  try {
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

    const detail = await scraper.getProductDetails(url, includeReviews);

    // Upsert product in DB
    const product = await prisma.product.upsert({
      where: {
        marketplace_externalId: {
          marketplace,
          externalId: detail.externalId || url,
        },
      },
      create: {
        marketplace,
        externalId: detail.externalId || url,
        url,
        name: detail.name,
        description: detail.description,
        imageUrl: detail.imageUrl,
        seller: detail.seller?.name,
        sellerUrl: detail.seller?.url,
        isOfficialStore: detail.seller?.isOfficial ?? false,
        location: detail.location,
        category: detail.category,
        rating: detail.rating ? new Decimal(detail.rating) : null,
        totalReviews: detail.totalReviews,
        totalSold: detail.totalSold,
        rawData: JSON.parse(JSON.stringify(detail)) as any,
        lastScrapedAt: new Date(),
      },
      update: {
        url,
        name: detail.name,
        description: detail.description,
        imageUrl: detail.imageUrl,
        seller: detail.seller?.name,
        rating: detail.rating ? new Decimal(detail.rating) : null,
        totalReviews: detail.totalReviews,
        totalSold: detail.totalSold,
        rawData: JSON.parse(JSON.stringify(detail)) as any,
        lastScrapedAt: new Date(),
      },
    });

    // Upsert variants
    if (detail.variants.length > 0) {
      // Delete old variants and re-insert (simpler than diffing)
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.createMany({
        data: detail.variants.map(v => ({
          productId: product.id,
          name: v.name,
          price: new Decimal(v.price),
          originalPrice: v.originalPrice ? new Decimal(v.originalPrice) : null,
          discountPercent: v.discountPercent ?? null,
          stock: v.stock,
          sku: v.sku,
          imageUrl: v.imageUrl,
        })),
      });
    }

    // Insert price history snapshot
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: new Decimal(detail.price),
        priceDisc: detail.discountPercent ? new Decimal(detail.price) : null,
      },
    });

    // Insert reviews if any
    if (detail.reviews.length > 0) {
      await prisma.review.createMany({
        data: detail.reviews.map(r => ({
          productId: product.id,
          author: r.author,
          rating: r.rating,
          content: r.content,
          reviewDate: r.reviewDate ? new Date(r.reviewDate) : null,
          helpful: r.helpful ?? 0,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.scrapeTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        resultRef: product.id,
      },
    });

    logger.info({ taskId, productId: product.id, name: detail.name }, '✅ Product detail job completed');

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ taskId, error: msg }, '❌ Product detail job failed');

    await prisma.scrapeTask.update({
      where: { id: taskId },
      data: {
        status: 'FAILED',
        errorMessage: msg,
        completedAt: new Date(),
        retryCount: { increment: 1 },
      },
    });

    throw error;
  }
}
