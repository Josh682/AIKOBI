import { Queue } from 'bullmq';
import type { Redis as RedisType } from 'ioredis';
import type { SearchJobPayload } from '@datascrapper/shared-types';

export function createSearchQueue(connection: RedisType): Queue<SearchJobPayload> {
  return new Queue<SearchJobPayload>('search', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50 },
    },
  });
}
