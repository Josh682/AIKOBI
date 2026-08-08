import { Queue } from 'bullmq';
import type { Redis as RedisType } from 'ioredis';
import type { ProductDetailJobPayload } from '@datascrapper/shared-types';

export function createProductQueue(connection: RedisType): Queue<ProductDetailJobPayload> {
  return new Queue<ProductDetailJobPayload>('product', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50 },
    },
  });
}
