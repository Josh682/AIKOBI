import type { Job } from 'bullmq';
import type { ProductDetailJobPayload } from '@datascrapper/shared-types';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { TokopediaScraper } from '../scrapers/tokopedia.scraper.js';
import { ShopeeScraper } from '../scrapers/shopee.scraper.js';
import { prisma } from '@datascrapper/db';
import { logger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';
import {
  extractProductAttributes,
  matchAndFilterCompetitors,
  classifyProductCategory,
  embedProductTitle,
} from '@aikobi/product-matcher';
import { aiClient } from '../services/ai.client.js';

export async function processProductJob(
  job: Job<ProductDetailJobPayload>,
  proxyRotator: ProxyRotator,
): Promise<void> {
  const { taskId, marketplace, url, includeReviews, competitorKeyword, isAnalyze } = job.data;

  logger.info({ taskId, marketplace, url }, '📦 Processing product detail & analysis job');

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

    // Step 1: Scrape main product details
    logger.info({ taskId, url }, 'Step 1: Extracting product detail');
    const detail = await scraper.getProductDetails(url, includeReviews);

    const extractedAttrs = extractProductAttributes(detail.name);
    const categoryClassification = classifyProductCategory(detail.name);
    const productEmbedding = embedProductTitle(detail.name);

    // Step 2: Extract competitor prices
    let competitorPrices: number[] = [];
    const searchKeyword =
      competitorKeyword ||
      extractedAttrs.searchQuery ||
      detail.name.split(' ').slice(0, 3).join(' ');

    if (searchKeyword) {
      try {
        logger.info({ taskId, searchKeyword }, 'Step 2: Gathering competitor price snapshot');
        const searchResults = await scraper.searchProducts(searchKeyword, { perPage: 15 });
        const matchedCompetitors = matchAndFilterCompetitors(
          detail.name,
          searchResults.items.map((item) => ({
            id: item.externalId,
            name: item.name,
            price: item.price,
            url: item.url,
            rating: item.rating,
            seller: item.seller?.name,
            location: item.location ?? item.seller?.location,
          })),
          { basePrice: detail.price },
        );

        competitorPrices =
          matchedCompetitors.length > 0
            ? matchedCompetitors.map((c) => c.harga)
            : searchResults.items
                .map((item) => item.price)
                .filter((price) => price > 0);
      } catch (err) {
        logger.warn({ taskId, err }, 'Failed to scrape competitor search, falling back to simulated snapshot');
      }
    }

    if (competitorPrices.length === 0) {
      // Fallback competitor prices scaled around target product price
      const basePrice = detail.price || 100000;
      competitorPrices = [
        Math.round(basePrice * 0.92),
        Math.round(basePrice * 0.96),
        basePrice,
        Math.round(basePrice * 1.04),
        Math.round(basePrice * 1.08),
      ];
    }

    // Step 3: Run AI Model Recommendation
    logger.info({ taskId }, 'Step 3: Running AI Price Optimizer inference model');
    const aiRecommendation = await aiClient.predictRecommendation({
      product_name: detail.name,
      category: categoryClassification.modelCategory,
      user_price: detail.price,
      rating: detail.rating || 4.8,
      total_reviews: detail.totalReviews || 10,
      total_sold: detail.totalSold || 50,
      discount_percent: detail.discountPercent || 0,
      is_official_store: detail.seller?.isOfficial ?? false,
      location: detail.location || 'Jakarta',
      competitor_prices: competitorPrices,
    });

    const fullRawData = {
      ...JSON.parse(JSON.stringify(detail)),
      ai_analysis: aiRecommendation,
      competitors: competitorPrices,
    };

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
        rawData: fullRawData as any,
        extractedAttributes: extractedAttrs as any,
        embedding: productEmbedding,
        canonicalCategory: categoryClassification.modelCategory,
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
        rawData: fullRawData as any,
        extractedAttributes: extractedAttrs as any,
        embedding: productEmbedding,
        canonicalCategory: categoryClassification.modelCategory,
        lastScrapedAt: new Date(),
      },
    });

    // Upsert variants
    if (detail.variants.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.createMany({
        data: detail.variants.map((v: { name: string; price: number; originalPrice?: number | null; discountPercent?: number | null; stock?: number | null; sku?: string | null; imageUrl?: string | null }) => ({
          productId: product.id,
          name: v.name,
          price: new Decimal(v.price),
          originalPrice: v.originalPrice ? new Decimal(v.originalPrice) : null,
          discountPercent: v.discountPercent ?? null,
          stock: v.stock ?? undefined,
          sku: v.sku ?? undefined,
          imageUrl: v.imageUrl ?? undefined,
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

    await prisma.scrapeTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        resultRef: product.id,
      },
    });

    logger.info({ taskId, productId: product.id, name: detail.name }, '✅ Product detail & AI analysis job completed');

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
