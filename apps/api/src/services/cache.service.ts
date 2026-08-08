import type { Redis } from 'ioredis';
import type { Marketplace } from '@datascrapper/shared-types';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const TTL_SECONDS = env.CACHE_TTL_HOURS * 60 * 60;

function buildSearchKey(marketplace: Marketplace, keyword: string, minPrice?: number, maxPrice?: number, page = 1): string {
  return `search:${marketplace}:${keyword.toLowerCase()}:${minPrice ?? ''}:${maxPrice ?? ''}:${page}`;
}

function buildProductKey(url: string): string {
  return `product:${Buffer.from(url).toString('base64')}`;
}

function buildTaskKey(taskId: string): string {
  return `task:${taskId}`;
}

export class CacheService {
  constructor(private redis: Redis) {}

  // ─── Search Cache ──────────────────────────────────────────

  async getSearch(marketplace: Marketplace, keyword: string, minPrice?: number, maxPrice?: number, page = 1): Promise<unknown | null> {
    const key = buildSearchKey(marketplace, keyword, minPrice, maxPrice, page);
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      logger.warn({ key }, 'Cache parse error');
      return null;
    }
  }

  async setSearch(marketplace: Marketplace, keyword: string, data: unknown, minPrice?: number, maxPrice?: number, page = 1): Promise<void> {
    const key = buildSearchKey(marketplace, keyword, minPrice, maxPrice, page);
    await this.redis.set(key, JSON.stringify(data), 'EX', TTL_SECONDS);
  }

  // ─── Product Cache ─────────────────────────────────────────

  async getProduct(url: string): Promise<unknown | null> {
    const key = buildProductKey(url);
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  async setProduct(url: string, data: unknown): Promise<void> {
    const key = buildProductKey(url);
    await this.redis.set(key, JSON.stringify(data), 'EX', TTL_SECONDS);
  }

  // ─── Task Status Cache (short TTL) ─────────────────────────

  async getTaskStatus(taskId: string): Promise<unknown | null> {
    const key = buildTaskKey(taskId);
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  }

  async setTaskStatus(taskId: string, data: unknown): Promise<void> {
    const key = buildTaskKey(taskId);
    // Keep task status for 1 hour after completion
    await this.redis.set(key, JSON.stringify(data), 'EX', 3600);
  }

  // ─── Generic Invalidation ─────────────────────────────────

  async invalidateProduct(url: string): Promise<void> {
    const key = buildProductKey(url);
    await this.redis.del(key);
  }

  async checkTTL(key: string): Promise<number> {
    return this.redis.ttl(key);
  }
}
