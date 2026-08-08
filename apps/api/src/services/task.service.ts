import { prisma } from '@datascrapper/db';
import type { CacheService } from './cache.service.js';
import type { TaskStatus } from '@datascrapper/shared-types';

export interface TaskStatusResult {
  taskId: string;
  type: string;
  status: TaskStatus;
  marketplace: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  data?: unknown;
}

export class TaskService {
  constructor(private cache: CacheService) {}

  async getStatus(taskId: string): Promise<TaskStatusResult | null> {
    // 1. Check Redis first (completed tasks are cached briefly)
    const cached = await this.cache.getTaskStatus(taskId);
    if (cached) return cached as TaskStatusResult;

    // 2. Query DB
    const task = await prisma.scrapeTask.findUnique({
      where: { id: taskId },
    });

    if (!task) return null;

    const result: TaskStatusResult = {
      taskId: task.id,
      type: task.type,
      status: task.status as TaskStatus,
      marketplace: task.marketplace,
      startedAt: task.startedAt?.toISOString() ?? null,
      completedAt: task.completedAt?.toISOString() ?? null,
      errorMessage: task.errorMessage,
      retryCount: task.retryCount,
    };

    // If completed, attach scraped result data
    if (task.status === 'COMPLETED') {
      if (task.type === 'SEARCH' && task.payload) {
        const p = task.payload as { keyword?: string; page?: number };
        if (p.keyword) {
          const cache = await prisma.searchCache.findFirst({
            where: {
              marketplace: task.marketplace,
              keyword: p.keyword.toLowerCase(),
              page: p.page ?? 1,
            },
            orderBy: { createdAt: 'desc' },
          });
          if (cache) {
            result.data = cache.resultData;
          }
        }
      } else if (task.type === 'PRODUCT' && task.payload) {
        const p = task.payload as { url?: string };
        if (p.url) {
          const prod = await prisma.product.findFirst({
            where: { url: p.url },
            include: { variants: true, reviews: { take: 10 } },
          });
          if (prod) {
            result.data = prod;
          }
        }
      }

      await this.cache.setTaskStatus(taskId, result);
    } else if (task.status === 'FAILED') {
      await this.cache.setTaskStatus(taskId, result);
    }

    return result;
  }
}
