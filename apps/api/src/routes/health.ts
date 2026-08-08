import type { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../utils/response.js';

const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health Check',
      description: 'Cek status server dan koneksi database/redis',
      security: [],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                uptime: { type: 'number' },
                timestamp: { type: 'string' },
                services: {
                  type: 'object',
                  properties: {
                    database: { type: 'string' },
                    redis: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (_request, reply) => {
    // Check DB
    let dbStatus = 'ok';
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    // Check Redis
    let redisStatus = 'ok';
    try {
      await fastify.redis.ping();
    } catch {
      redisStatus = 'error';
    }

    const isHealthy = dbStatus === 'ok' && redisStatus === 'ok';
    return reply.code(isHealthy ? 200 : 503).send(
      successResponse({
        status: isHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: { database: dbStatus, redis: redisStatus },
      }),
    );
  });
};

export default healthRoute;
