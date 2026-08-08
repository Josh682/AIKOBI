import { Queue } from 'bullmq';
import type { Redis as RedisType } from 'ioredis';
import type { CollectionProductJobPayload } from '@datascrapper/shared-types';

/**
 * Queue untuk scheduled product price tracking collection.
 * Dipakai untuk memonitor perubahan harga produk-produk yang sudah di-track.
 */
export function createCollectionProductQueue(
  connection: RedisType,
): Queue<CollectionProductJobPayload> {
  return new Queue<CollectionProductJobPayload>('collection-product', {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 200, age: 86400 * 7 }, // Simpan 7 hari
      removeOnFail: { count: 100, age: 86400 * 3 },
    },
  });
}
