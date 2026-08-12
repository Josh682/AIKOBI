import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ProductService } from '../services/product.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { prisma } from '@datascrapper/db';

const productQuerySchema = z.object({
  url: z.string().url('Must be a valid product URL'),
  marketplace: z.enum(['TOKOPEDIA', 'SHOPEE', 'BUKALAPAK', 'LAZADA', 'BLIBLI']),
  include_reviews: z.coerce.boolean().default(false),
});

const analyzeQuerySchema = z.object({
  url: z.string().url('Must be a valid Tokopedia product URL'),
  marketplace: z.enum(['TOKOPEDIA', 'SHOPEE']).default('TOKOPEDIA'),
  competitor_keyword: z.string().optional(),
  competitor_urls: z.array(z.string().url()).optional(),
});

const productRoute: FastifyPluginAsync = async (fastify) => {
  const productService = new ProductService(fastify.redis);

  fastify.get('/api/v1/product/details', {
    schema: {
      tags: ['Product'],
      summary: 'Detail Produk',
      description: `
Mengambil detail produk lengkap dari URL spesifik.
      `,
      querystring: {
        type: 'object',
        required: ['url', 'marketplace'],
        properties: {
          url: { type: 'string', description: 'URL produk di marketplace', example: 'https://www.tokopedia.com/store/product-name' },
          marketplace: { type: 'string', enum: ['TOKOPEDIA', 'SHOPEE', 'BUKALAPAK', 'LAZADA', 'BLIBLI'] },
          include_reviews: { type: 'boolean', default: false, description: 'Sertakan ulasan pembeli' },
        },
      },
    },
  }, async (request, reply) => {
    const parseResult = productQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.code(400).send(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters', parseResult.error.issues),
      );
    }

    const { url, marketplace, include_reviews } = parseResult.data;
    const startTime = Date.now();

    const result = await productService.getDetails(url, marketplace, request.apiKeyId, request.userId, include_reviews);

    prisma.user.update({
      where: { id: request.userId },
      data: { quotaUsed: { increment: 1 } },
    }).catch(() => {});

    if (result.cached && result.data) {
      return reply.send(successResponse(result.data, {
        cached: true,
        marketplace,
        responseTimeMs: Date.now() - startTime,
        quotaRemaining: request.quotaRemaining - 1,
      }));
    }

    return reply.code(202).send(successResponse(
      { taskId: result.taskId, status: 'PENDING', message: 'Scraping job enqueued. Poll /api/v1/task/status/:taskId for results.' },
      { cached: false, responseTimeMs: Date.now() - startTime, quotaRemaining: request.quotaRemaining - 1 },
    ));
  });

  fastify.post('/api/v1/product/analyze', {
    schema: {
      tags: ['AI Price Optimizer'],
      summary: 'Analisis Optimasi Harga Produk',
      description: 'Menerima URL produk Tokopedia, melakukan scraping data produk & kompetitor, lalu menjalankan model AI untuk rekomendasi harga.',
      body: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', description: 'URL produk Tokopedia', example: 'https://www.tokopedia.com/store/product-name' },
          marketplace: { type: 'string', enum: ['TOKOPEDIA', 'SHOPEE'], default: 'TOKOPEDIA' },
          competitor_keyword: { type: 'string', description: 'Kata kunci pencarian kompetitor (opsional)' },
          competitor_urls: { type: 'array', items: { type: 'string' }, description: 'Daftar URL kompetitor spesifik (opsional)' },
        },
      },
    },
  }, async (request, reply) => {
    const parseResult = analyzeQuerySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send(
        errorResponse('VALIDATION_ERROR', 'Invalid request body', parseResult.error.issues),
      );
    }

    const { url, marketplace, competitor_keyword, competitor_urls } = parseResult.data;
    const startTime = Date.now();

    const apiKeyId = request.apiKeyId || 'demo-api-key';
    const userId = request.userId || 'demo-user-id';

    const result = await productService.analyzeProduct(url, marketplace, apiKeyId, userId, competitor_keyword, competitor_urls);

    return reply.code(202).send(successResponse(
      {
        taskId: result.taskId,
        status: 'PENDING',
        message: 'Product AI analysis task enqueued. Poll /api/v1/task/status/:taskId for real-time progress & results.',
      },
      { cached: false, responseTimeMs: Date.now() - startTime },
    ));
  });
};

export default productRoute;
