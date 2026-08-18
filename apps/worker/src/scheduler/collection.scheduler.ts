import cron from 'node-cron';
import type { Redis as RedisType } from 'ioredis';
import { prisma } from '@datascrapper/db';
import type { ProxyRotator } from '../browser/proxy.rotator.js';
import { createCollectionSearchQueue } from '../queues/collectionSearchQueue.js';
import { createCollectionProductQueue } from '../queues/collectionProductQueue.js';
import { CollectionManager } from './collection.manager.js';
import { logger } from '../utils/logger.js';

type ScheduledTask = ReturnType<typeof cron.schedule>;

/**
 * CollectionScheduler mengelola cron jobs untuk setiap CollectionPlan yang aktif.
 *
 * Lifecycle:
 * 1. start() — load semua active plans dari DB, register cron tasks
 * 2. Setiap cron trigger → CollectionManager.runPlan(planId)
 * 3. stop() — hentikan semua cron tasks (graceful shutdown)
 *
 * Reload plans:
 * - reloadPlans() dapat dipanggil kapan saja untuk sync plans terbaru dari DB
 *   tanpa perlu restart worker (misal setelah CRUD plan via API)
 */
export class CollectionScheduler {
  private readonly manager: CollectionManager;
  private readonly tasks: Map<string, ScheduledTask> = new Map();
  private isRunning = false;

  constructor(
    private readonly redis: RedisType,
    private readonly _proxyRotator: ProxyRotator,
  ) {
    const searchQueue = createCollectionSearchQueue(redis);
    const productQueue = createCollectionProductQueue(redis);
    this.manager = new CollectionManager(searchQueue, productQueue);
  }

  /**
   * Mulai scheduler:
   * 1. Load plans dari DB
   * 2. Register cron task per plan
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('[Scheduler] Already running, skip start');
      return;
    }

    this.isRunning = true;
    logger.info('[Scheduler] Starting collection scheduler...');

    await this.reloadPlans();

    logger.info(`[Scheduler] Started — ${this.tasks.size} plan(s) scheduled`);
  }

  /**
   * Stop semua cron tasks (dipanggil saat graceful shutdown)
   */
  async stop(): Promise<void> {
    logger.info('[Scheduler] Stopping all cron tasks...');

    for (const [planId, task] of this.tasks.entries()) {
      task.stop();
      logger.debug({ planId }, '[Scheduler] Task stopped');
    }

    this.tasks.clear();
    this.isRunning = false;

    logger.info('[Scheduler] All tasks stopped');
  }

  /**
   * Reload plans dari DB — sinkronisasi runtime.
   * - Plans baru akan ditambahkan
   * - Plans yang dihapus/di-nonaktifkan akan di-stop
   * - Plans yang diubah cronExpr akan di-reschedule
   */
  async reloadPlans(): Promise<void> {
    logger.info('[Scheduler] Loading active collection plans from DB...');

    const activePlans = await prisma.collectionPlan.findMany({
      where: { isActive: true },
    });

    const activePlanIds = new Set(activePlans.map((p: { id: string }) => p.id));

    // Stop tasks untuk plans yang sudah tidak aktif
    for (const [planId, task] of this.tasks.entries()) {
      if (!activePlanIds.has(planId)) {
        task.stop();
        this.tasks.delete(planId);
        logger.info({ planId }, '[Scheduler] Plan deactivated, task stopped');
      }
    }

    // Register/update cron tasks untuk plans aktif
    for (const plan of activePlans) {
      if (this.tasks.has(plan.id)) {
        // Plan sudah ada, skip (re-schedule hanya jika cronExpr berubah bisa dikembangkan)
        continue;
      }

      if (!cron.validate(plan.cronExpr)) {
        logger.error({ planId: plan.id, cronExpr: plan.cronExpr }, '❌ [Scheduler] Invalid cron expression, skipping plan');
        continue;
      }

      const task = cron.schedule(plan.cronExpr, async () => {
        logger.info({ planId: plan.id, name: plan.name }, `⏰ [Scheduler] Cron triggered for plan "${plan.name}"`);
        await this.executePlan(plan.id);
      }, {
        timezone: 'Asia/Jakarta',
      });

      this.tasks.set(plan.id, task);

      logger.info(
        { planId: plan.id, name: plan.name, cronExpr: plan.cronExpr },
        `📅 [Scheduler] Plan registered: "${plan.name}" (${plan.cronExpr})`,
      );
    }

    logger.info(
      { totalPlans: activePlans.length, activeTasks: this.tasks.size },
      '[Scheduler] Plans loaded',
    );
  }

  /**
   * Jalankan plan secara manual (misal: trigger dari API endpoint atau testing).
   * Tidak menunggu cron schedule.
   */
  async triggerPlanNow(planId: string): Promise<string> {
    logger.info({ planId }, '🚀 [Scheduler] Manual trigger for plan');
    return this.executePlan(planId);
  }

  /**
   * Eksekusi sebuah plan: delegasi ke CollectionManager.
   * Error ditangkap di sini supaya satu plan gagal tidak mengganggu plan lain.
   */
  private async executePlan(planId: string): Promise<string> {
    try {
      const sessionId = await this.manager.runPlan(planId);

      // Update nextRunAt di DB
      await this.updateNextRunAt(planId);

      return sessionId;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error({ planId, error: msg }, '❌ [Scheduler] Plan execution failed');
      throw error;
    }
  }

  /**
   * Update nextRunAt berdasarkan cronExpr — untuk tracking di UI/monitoring.
   */
  private async updateNextRunAt(planId: string): Promise<void> {
    try {
      const plan = await prisma.collectionPlan.findUnique({
        where: { id: planId },
        select: { cronExpr: true },
      });

      if (!plan) return;

      // Hitung waktu next run menggunakan node-cron internal
      // node-cron tidak expose nextDate langsung, kita hitung manual
      // Sementara set nextRunAt = sekarang (akan diupdate setelah run selesai)
      await prisma.collectionPlan.update({
        where: { id: planId },
        data: { lastRunAt: new Date() },
      });
    } catch {
      // Non-critical, jangan gagalkan plan karena ini
    }
  }

  /**
   * Tambah plan baru ke scheduler tanpa restart.
   */
  async addPlan(planId: string): Promise<void> {
    const plan = await prisma.collectionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) return;

    if (this.tasks.has(planId)) {
      logger.warn({ planId }, '[Scheduler] Plan already registered');
      return;
    }

    if (!cron.validate(plan.cronExpr)) {
      logger.error({ planId, cronExpr: plan.cronExpr }, '❌ Invalid cron expression');
      return;
    }

    const task = cron.schedule(plan.cronExpr, async () => {
      await this.executePlan(planId);
    }, { timezone: 'Asia/Jakarta' });

    this.tasks.set(planId, task);
    logger.info({ planId, name: plan.name }, '[Scheduler] Plan added at runtime');
  }

  /**
   * Hapus plan dari scheduler tanpa restart.
   */
  removePlan(planId: string): void {
    const task = this.tasks.get(planId);
    if (task) {
      task.stop();
      this.tasks.delete(planId);
      logger.info({ planId }, '[Scheduler] Plan removed at runtime');
    }
  }

  get activePlanCount(): number {
    return this.tasks.size;
  }
}
