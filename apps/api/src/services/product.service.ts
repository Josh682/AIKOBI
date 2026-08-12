import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import type { Marketplace } from '@datascrapper/shared-types';
import type { ProductDetailJobPayload } from '@datascrapper/shared-types';
import { prisma } from '@datascrapper/db';
import { v4 as uuidv4 } from 'uuid';
import { CacheService } from './cache.service.js';
import { logger } from '../utils/logger.js';

export class ProductService {
  private queue: Queue<ProductDetailJobPayload>;
  private cache: CacheService;

  constructor(redis: Redis) {
    this.queue = new Queue<ProductDetailJobPayload>('product', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
    this.cache = new CacheService(redis);
  }

  async getDetails(url: string, marketplace: string, apiKeyId: string, userId: string, includeReviews = false): Promise<{ taskId: string; cached: boolean; data?: unknown }> {
    const cached = await this.cache.getProduct(url);
    if (cached) {
      logger.debug({ url }, 'Cache HIT for product');
      return { taskId: '', cached: true, data: cached };
    }

    const existingProduct = await prisma.product.findUnique({
      where: { url },
      include: {
        variants: true,
        reviews: includeReviews,
        priceHistory: { orderBy: { scrapedAt: 'desc' }, take: 10 },
      },
    });

    const cacheWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (existingProduct && existingProduct.lastScrapedAt > cacheWindow) {
      await this.cache.setProduct(url, existingProduct);
      return { taskId: '', cached: true, data: existingProduct };
    }

    const taskId = uuidv4();

    await prisma.scrapeTask.create({
      data: {
        id: taskId,
        type: 'PRODUCT_DETAIL',
        status: 'PENDING',
        marketplace: marketplace as Marketplace,
        payload: { url, includeReviews },
        apiKeyId,
      },
    });

    const payload: ProductDetailJobPayload = {
      taskId,
      apiKeyId,
      userId,
      marketplace: marketplace as Marketplace,
      requestedAt: new Date().toISOString(),
      type: 'PRODUCT_DETAIL',
      url,
      includeReviews,
    };

    await this.queue.add(`product:${taskId}`, payload, { jobId: taskId });
    logger.info({ taskId, url }, 'Product detail job enqueued');

    return { taskId, cached: false };
  }

  async analyzeProduct(
    url: string,
    marketplace: string,
    apiKeyId: string,
    userId: string,
    competitorKeyword?: string,
    competitorUrls?: string[]
  ): Promise<{ taskId: string }> {
    const taskId = uuidv4();

    await prisma.scrapeTask.create({
      data: {
        id: taskId,
        type: 'PRODUCT_DETAIL',
        status: 'PENDING',
        marketplace: marketplace as Marketplace,
        payload: { url, competitorKeyword, competitorUrls, isAnalyze: true },
        apiKeyId,
      },
    });

    const payload: ProductDetailJobPayload = {
      taskId,
      apiKeyId,
      userId,
      marketplace: marketplace as Marketplace,
      requestedAt: new Date().toISOString(),
      type: 'PRODUCT_DETAIL',
      url,
      includeReviews: false,
      competitorKeyword,
      competitorUrls,
      isAnalyze: true,
    };

    await this.queue.add(`product:${taskId}`, payload, { jobId: taskId });
    logger.info({ taskId, url, competitorKeyword }, 'Product analysis job enqueued');

    return { taskId };
  }
}
