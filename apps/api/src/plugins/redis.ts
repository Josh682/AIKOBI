import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  const redis = new Redis(env.REDIS_URL, {
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redis.on('connect', () => logger.info('✅ Redis connected'));
  redis.on('error', (err) => logger.error({ err }, 'Redis error'));

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    await redis.quit();
    logger.info('Redis disconnected');
  });
};

export default fp(redisPlugin, { name: 'redis' });
