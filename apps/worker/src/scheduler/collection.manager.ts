import { prisma } from '@datascrapper/db';
import type { Queue } from 'bullmq';
import type {
  CollectionSearchJobPayload,
  CollectionProductJobPayload,
} from '@datascrapper/shared-types';
import { logger } from '../utils/logger.js';

/**
 * CollectionManager bertanggung jawab untuk:
 * 1. Membuat CollectionSession di DB saat plan di-trigger
 * 2. Enqueue semua jobs yang diperlukan ke BullMQ
 * 3. Menyelesaikan session setelah semua jobs selesai (dipanggil dari luar)
 */
export class CollectionManager {
  constructor(
    private readonly searchQueue: Queue<CollectionSearchJobPayload>,
    private readonly productQueue: Queue<CollectionProductJobPayload>,
  ) {}

  /**
   * Jalankan sebuah CollectionPlan:
   * - Buat session baru
   * - Enqueue jobs sesuai tipe plan (KEYWORD_SEARCH | PRODUCT_TRACK)
   */
  async runPlan(planId: string): Promise<string> {
    // Ambil plan dari DB
    const plan = await prisma.collectionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new Error(`CollectionPlan ${planId} tidak ditemukan`);
    if (!plan.isActive) {
      logger.warn({ planId }, 'Plan tidak aktif, skip');
      throw new Error(`Plan ${planId} tidak aktif`);
    }

    logger.info({ planId, name: plan.name, type: plan.type }, '▶ [Manager] Starting collection plan');

    // Hitung total jobs yang akan di-enqueue
    let totalJobs = 0;
    if (plan.type === 'KEYWORD_SEARCH') {
      totalJobs = plan.maxPages; // 1 job per halaman
    } else {
      totalJobs = plan.productUrls.length; // 1 job per URL
    }

    // Buat CollectionSession
    const session = await prisma.collectionSession.create({
      data: {
        planId,
        status: 'RUNNING',
        totalJobs,
      },
    });

    const sessionId = session.id;
    logger.info({ sessionId, planId, totalJobs }, '📋 [Manager] Session created');

    try {
      if (plan.type === 'KEYWORD_SEARCH') {
        await this.enqueueKeywordSearchJobs(session.id, plan);
      } else {
        await this.enqueueProductTrackJobs(session.id, plan);
      }

      // Update plan metadata
      await prisma.collectionPlan.update({
        where: { id: planId },
        data: {
          lastRunAt: new Date(),
          totalRuns: { increment: 1 },
        },
      });

      await prisma.collectionLog.create({
        data: {
          sessionId,
          level: 'INFO',
          message: `Session dimulai: ${totalJobs} job di-enqueue`,
          metadata: { planId, planName: plan.name, type: plan.type, totalJobs },
        },
      });

      logger.info({ sessionId, planId, totalJobs }, '✅ [Manager] All jobs enqueued');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);

      // Tandai session sebagai FAILED jika enqueue gagal
      await prisma.collectionSession.update({
        where: { id: sessionId },
        data: { status: 'FAILED', completedAt: new Date(), errorMessage: msg },
      });

      throw error;
    }

    return sessionId;
  }

  /**
   * Enqueue jobs untuk tipe KEYWORD_SEARCH.
   * Hanya enqueue halaman pertama; halaman berikutnya di-enqueue
   * oleh processor sendiri setelah halaman sebelumnya selesai.
   */
  private async enqueueKeywordSearchJobs(
    sessionId: string,
    plan: {
      id: string;
      marketplace: string;
      keyword: string | null;
      minPrice: unknown;
      maxPrice: unknown;
      maxPages: number;
    },
  ): Promise<void> {
    if (!plan.keyword) throw new Error('keyword harus diisi untuk KEYWORD_SEARCH');

    const payload: CollectionSearchJobPayload = {
      sessionId,
      planId: plan.id,
      marketplace: plan.marketplace as CollectionSearchJobPayload['marketplace'],
      keyword: plan.keyword,
      minPrice: plan.minPrice ? Number(plan.minPrice) : undefined,
      maxPrice: plan.maxPrice ? Number(plan.maxPrice) : undefined,
      page: 1,
      maxPages: plan.maxPages,
    };

    await this.searchQueue.add(
      `${plan.id}-session-${sessionId}-page-1`,
      payload,
    );

    logger.debug({ sessionId, keyword: plan.keyword, maxPages: plan.maxPages }, '[Manager] Search job enqueued (page 1)');
  }

  /**
   * Enqueue jobs untuk tipe PRODUCT_TRACK.
   * Setiap URL produk mendapat satu job tersendiri, dengan delay bertahap
   * supaya tidak memicu rate limiting.
   */
  private async enqueueProductTrackJobs(
    sessionId: string,
    plan: {
      id: string;
      marketplace: string;
      productUrls: string[];
    },
  ): Promise<void> {
    const jobs = plan.productUrls.map((url, index) => ({
      name: `${plan.id}-session-${sessionId}-product-${index}`,
      data: {
        sessionId,
        planId: plan.id,
        marketplace: plan.marketplace as CollectionProductJobPayload['marketplace'],
        url,
        trackPriceChange: true,
      } satisfies CollectionProductJobPayload,
      opts: {
        delay: index * 4000, // 4 detik antara setiap job supaya tidak kena rate limit
      },
    }));

    await this.productQueue.addBulk(jobs);

    logger.debug(
      { sessionId, urlCount: plan.productUrls.length },
      '[Manager] Product track jobs enqueued',
    );
  }

  /**
   * Tandai session sebagai COMPLETED.
   * Dipanggil oleh scheduler setelah memverifikasi semua jobs selesai,
   * atau bisa dipanggil secara manual.
   */
  async finalizeSession(sessionId: string): Promise<void> {
    const session = await prisma.collectionSession.findUnique({
      where: { id: sessionId },
      select: {
        totalJobs: true,
        completedJobs: true,
        failedJobs: true,
        startedAt: true,
      },
    });

    if (!session) return;

    const durationMs = Date.now() - session.startedAt.getTime();
    const status = session.failedJobs === session.totalJobs ? 'FAILED' : 'COMPLETED';

    await prisma.collectionSession.update({
      where: { id: sessionId },
      data: {
        status,
        completedAt: new Date(),
        durationMs,
      },
    });

    await prisma.collectionLog.create({
      data: {
        sessionId,
        level: status === 'FAILED' ? 'ERROR' : 'INFO',
        message: `Session selesai [${status}]: ${session.completedJobs}/${session.totalJobs} jobs berhasil`,
        metadata: { durationMs, completedJobs: session.completedJobs, failedJobs: session.failedJobs },
      },
    });

    logger.info({ sessionId, status, durationMs }, '🏁 [Manager] Session finalized');
  }
}
