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

const productRoute: FastifyPluginAsync = async (fastify) => {
  const productService = new ProductService(fastify.redis);

  fastify.get('/api/v1/product/details', {
    schema: {
      tags: ['Product'],
      summary: 'Detail Produk',
      description: `
Mengambil detail produk lengkap dari URL spesifik.

**Data yang dikembalikan:**
- Informasi produk (nama, deskripsi, kategori)
- Semua varian (ukuran, warna, dll) + stok per varian
- Riwayat harga (10 terakhir)
- Ulasan pembeli (opsional, via \`include_reviews=true\`)
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

    // Deduct quota
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
};

export default productRoute;
