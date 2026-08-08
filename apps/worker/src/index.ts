import { Worker } from 'bullmq';
import { Redis as IORedis } from 'ioredis';
import type {
  SearchJobPayload,
  ProductDetailJobPayload,
  CollectionSearchJobPayload,
  CollectionProductJobPayload,
} from '@datascrapper/shared-types';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { ProxyRotator } from './browser/proxy.rotator.js';
import { BrowserManager } from './browser/manager.js';
import { processSearchJob } from './processors/search.processor.js';
import { processProductJob } from './processors/product.processor.js';
import { processCollectionSearchJob } from './processors/collection-search.processor.js';
import { processCollectionProductJob } from './processors/collection-product.processor.js';
import { CollectionScheduler } from './scheduler/collection.scheduler.js';
import { prisma } from '@datascrapper/db';

// ─── Bootstrap ────────────────────────────────────────────────

async function bootstrap() {
  logger.info('🚀 DataScrapper Worker starting...');

  // Initialize Redis connection
  const redis = new IORedis(env.REDIS_URL, {
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Required for BullMQ workers
    enableReadyCheck: false,
  });

  redis.on('connect', () => logger.info('✅ Redis connected'));
  redis.on('error', (err: Error) => logger.error({ err }, 'Redis error'));

  // Initialize proxy rotator
  const proxyRotator = new ProxyRotator(env.PROXY_LIST);
  logger.info({ proxyCount: proxyRotator.count }, proxyRotator.count > 0
    ? `🔄 ${proxyRotator.count} proxies loaded`
    : '⚠️  No proxies — using direct connection',
  );

  // Pre-warm browser
  logger.info('🌐 Pre-warming browser...');
  await BrowserManager.getInstance().getBrowser(env.BROWSER_HEADLESS);

  // Verify DB connection
  await prisma.$queryRaw`SELECT 1`;
  logger.info('✅ Database connected');

  const concurrency = env.MAX_CONCURRENT_JOBS;

  // ─── On-Demand Search Worker ──────────────────────────────

  const searchWorker = new Worker<SearchJobPayload>(
    'search',
    async (job) => {
      await processSearchJob(job, proxyRotator);
    },
    {
      connection: redis,
      concurrency,
      limiter: { max: 10, duration: 60_000 }, // 10 jobs/min rate limit
    },
  );

  searchWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '✅ Search job completed');
  });

  searchWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, '❌ Search job failed');
  });

  searchWorker.on('active', (job) => {
    logger.debug({ jobId: job.id, keyword: job.data.keyword }, '▶ Search job started');
  });

  // ─── On-Demand Product Worker ─────────────────────────────

  const productWorker = new Worker<ProductDetailJobPayload>(
    'product',
    async (job) => {
      await processProductJob(job, proxyRotator);
    },
    {
      connection: redis,
      concurrency,
      limiter: { max: 10, duration: 60_000 },
    },
  );

  productWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '✅ Product job completed');
  });

  productWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, '❌ Product job failed');
  });

  productWorker.on('active', (job) => {
    logger.debug({ jobId: job.id, url: job.data.url }, '▶ Product job started');
  });

  // ─── Collection Search Worker (Scheduled) ─────────────────

  const collectionSearchWorker = new Worker<CollectionSearchJobPayload>(
    'collection-search',
    async (job) => {
      await processCollectionSearchJob(job, proxyRotator);
    },
    {
      connection: redis,
      concurrency: 2, // Lebih rendah dari on-demand supaya tidak overload
      limiter: { max: 5, duration: 60_000 }, // 5 jobs/min — gentle untuk anti-bot
    },
  );

  collectionSearchWorker.on('completed', (job) => {
    logger.info({ jobId: job.id, sessionId: job.data.sessionId }, '✅ [Collection] Search job completed');
  });

  collectionSearchWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, '❌ [Collection] Search job failed');
  });

  collectionSearchWorker.on('active', (job) => {
    logger.debug(
      { jobId: job.id, keyword: job.data.keyword, page: job.data.page },
      '▶ [Collection] Search job started',
    );
  });

  // ─── Collection Product Worker (Scheduled) ────────────────

  const collectionProductWorker = new Worker<CollectionProductJobPayload>(
    'collection-product',
    async (job) => {
      await processCollectionProductJob(job, proxyRotator);
    },
    {
      connection: redis,
      concurrency: 2,
      limiter: { max: 5, duration: 60_000 },
    },
  );

  collectionProductWorker.on('completed', (job) => {
    logger.info({ jobId: job.id, sessionId: job.data.sessionId }, '✅ [Collection] Product job completed');
  });

  collectionProductWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, '❌ [Collection] Product job failed');
  });

  collectionProductWorker.on('active', (job) => {
    logger.debug({ jobId: job.id, url: job.data.url }, '▶ [Collection] Product job started');
  });

  // ─── Collection Scheduler ─────────────────────────────────

  const collectionScheduler = new CollectionScheduler(redis, proxyRotator);
  await collectionScheduler.start();
  logger.info(`📅 Collection scheduler started — ${collectionScheduler.activePlanCount} plan(s) active`);

  logger.info(`🎯 Workers ready (concurrency: ${concurrency})`);
  logger.info('   Watching queues: [search] [product] [collection-search] [collection-product]');

  // ─── Graceful Shutdown ────────────────────────────────────

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal} — shutting down gracefully...`);

    // Stop scheduler dulu supaya tidak ada plan baru yang di-trigger
    await collectionScheduler.stop();

    await Promise.all([
      searchWorker.close(),
      productWorker.close(),
      collectionSearchWorker.close(),
      collectionProductWorker.close(),
    ]);

    await BrowserManager.getInstance().close();
    await prisma.$disconnect();
    await redis.quit();

    logger.info('Worker shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection in worker');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Worker bootstrap failed:', err);
  process.exit(1);
});
