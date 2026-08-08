import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { SearchService } from '../services/search.service.js';
import { CacheService } from '../services/cache.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { prisma } from '@datascrapper/db';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  marketplace: z.enum(['TOKOPEDIA', 'SHOPEE', 'BUKALAPAK', 'LAZADA', 'BLIBLI']),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(20),
});

const searchRoute: FastifyPluginAsync = async (fastify) => {
  const searchService = new SearchService(fastify.redis);
  const cacheService = new CacheService(fastify.redis);

  fastify.get('/api/v1/search', {
    schema: {
      tags: ['Search'],
      summary: 'Cari Produk',
      description: `
Mencari produk di marketplace berdasarkan kata kunci.

**Flow:**
1. Jika cache tersedia → return data langsung (fast)
2. Jika tidak → enqueue job scraping & return \`taskId\`
3. Klien polling \`/api/v1/task/status/:taskId\` sampai selesai
      `,
      querystring: {
        type: 'object',
        required: ['q', 'marketplace'],
        properties: {
          q: { type: 'string', description: 'Kata kunci pencarian', example: 'sepatu nike' },
          marketplace: { type: 'string', enum: ['TOKOPEDIA', 'SHOPEE', 'BUKALAPAK', 'LAZADA', 'BLIBLI'] },
          min_price: { type: 'number', description: 'Harga minimum (IDR)', example: 100000 },
          max_price: { type: 'number', description: 'Harga maksimum (IDR)', example: 500000 },
          page: { type: 'integer', default: 1 },
          per_page: { type: 'integer', default: 20, maximum: 50 },
        },
      },
    },
  }, async (request, reply) => {
    const parseResult = searchQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.code(400).send(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters', parseResult.error.issues),
      );
    }

    const params = parseResult.data;
    const startTime = Date.now();

    const result = await searchService.search(params, request.apiKeyId, request.userId);

    // Deduct quota (fire & forget)
    prisma.user.update({
      where: { id: request.userId },
      data: { quotaUsed: { increment: 1 } },
    }).catch(() => {});

    // Log audit
    prisma.auditLog.create({
      data: {
        userId: request.userId,
        apiKeyId: request.apiKeyId,
        endpoint: '/api/v1/search',
        method: 'GET',
        statusCode: 200,
        clientIp: request.ip,
        userAgent: request.headers['user-agent'],
        durationMs: Date.now() - startTime,
        quotaCost: 1,
      },
    }).catch(() => {});

    if (result.cached && result.data) {
      return reply.send(successResponse(result.data, {
        cached: true,
        marketplace: params.marketplace,
        responseTimeMs: Date.now() - startTime,
        quotaRemaining: request.quotaRemaining - 1,
      }));
    }

    // Return task ID for polling
    return reply.code(202).send(successResponse(
      { taskId: result.taskId, status: 'PENDING', message: 'Scraping job enqueued. Poll /api/v1/task/status/:taskId for results.' },
      { cached: false, responseTimeMs: Date.now() - startTime, quotaRemaining: request.quotaRemaining - 1 },
    ));
  });
};

export default searchRoute;
