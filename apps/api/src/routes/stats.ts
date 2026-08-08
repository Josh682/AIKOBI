import type { FastifyPluginAsync } from 'fastify';
import { getUserStats } from '../services/stats.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const statsRoute: FastifyPluginAsync = async (fastify) => {

  // GET /api/v1/stats/usage
  fastify.get('/api/v1/stats/usage', {
    schema: {
      tags: ['Stats'],
      summary: 'Statistik penggunaan API untuk user yang terautentikasi',
      description: 'Mengembalikan quota, jumlah request, success rate, dan aktivitas terbaru.',
      security: [{ BearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const stats = await getUserStats(request.jwtUserId);
      return reply.send(successResponse(stats));
    } catch (err: unknown) {
      const e = err as { statusCode?: number; code?: string; message: string };
      return reply.code(e.statusCode ?? 500).send(
        errorResponse((e.code as any) ?? 'INTERNAL_ERROR', e.message),
      );
    }
  });
};

export default statsRoute;
