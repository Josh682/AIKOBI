import { Queue } from 'bullmq';
import type { Redis as RedisType } from 'ioredis';
import type { CollectionSearchJobPayload } from '@datascrapper/shared-types';

/**
 * Queue untuk scheduled keyword search collection.
 * Rate limit lebih rendah dari on-demand queue supaya tidak trigger anti-bot.
 */
export function createCollectionSearchQueue(
  connection: RedisType,
): Queue<CollectionSearchJobPayload> {
  return new Queue<CollectionSearchJobPayload>('collection-search', {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 200, age: 86400 * 7 }, // Simpan 7 hari
      removeOnFail: { count: 100, age: 86400 * 3 },
    },
  });
}
