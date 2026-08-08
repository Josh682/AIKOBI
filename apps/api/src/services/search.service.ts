import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import type { Marketplace, SearchRequest } from '@datascrapper/shared-types';
import type { SearchJobPayload } from '@datascrapper/shared-types';
import { prisma } from '@datascrapper/db';
import { v4 as uuidv4 } from 'uuid';
import { CacheService } from './cache.service.js';
import { logger } from '../utils/logger.js';

export class SearchService {
  private queue: Queue<SearchJobPayload>;
  private cache: CacheService;

  constructor(redis: Redis) {
    this.queue = new Queue<SearchJobPayload>('search', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
    this.cache = new CacheService(redis);
  }

  async search(params: SearchRequest, apiKeyId: string, userId: string): Promise<{ taskId: string; cached: boolean; data?: unknown }> {
    const { q, marketplace, min_price, max_price, page = 1, per_page = 20 } = params;

    // 1. Check Redis cache first
    const cached = await this.cache.getSearch(marketplace as Marketplace, q, min_price, max_price, page);
    if (cached) {
      logger.debug({ keyword: q, marketplace }, 'Cache HIT for search');
      return { taskId: '', cached: true, data: cached };
    }

    // 2. Check DB cache (within TTL)
    const dbCache = await prisma.searchCache.findFirst({
      where: {
        marketplace: marketplace as Marketplace,
        keyword: q.toLowerCase(),
        minPrice: min_price ?? null,
        maxPrice: max_price ?? null,
        page,
        expiresAt: { gt: new Date() },
      },
    });

    if (dbCache) {
      // Re-populate Redis
      await this.cache.setSearch(marketplace as Marketplace, q, dbCache.resultData, min_price, max_price, page);
      return { taskId: '', cached: true, data: dbCache.resultData };
    }

    // 3. Cache miss — enqueue scraping job
    const taskId = uuidv4();

    await prisma.scrapeTask.create({
      data: {
        id: taskId,
        type: 'SEARCH',
        status: 'PENDING',
        marketplace: marketplace as Marketplace,
        payload: { keyword: q, minPrice: min_price, maxPrice: max_price, page, perPage: per_page },
        apiKeyId,
      },
    });

    const payload: SearchJobPayload = {
      taskId,
      apiKeyId,
      userId,
      marketplace: marketplace as Marketplace,
      requestedAt: new Date().toISOString(),
      type: 'SEARCH',
      keyword: q,
      minPrice: min_price,
      maxPrice: max_price,
      page,
      perPage: per_page,
    };

    await this.queue.add(`search:${taskId}`, payload, { jobId: taskId });

    logger.info({ taskId, keyword: q, marketplace }, 'Search job enqueued');

    return { taskId, cached: false };
  }
}
