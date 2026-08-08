import type { FastifyPluginAsync } from 'fastify';
import { TaskService } from '../services/task.service.js';
import { CacheService } from '../services/cache.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const taskRoute: FastifyPluginAsync = async (fastify) => {
  const cacheService = new CacheService(fastify.redis);
  const taskService = new TaskService(cacheService);

  fastify.get<{ Params: { taskId: string } }>('/api/v1/task/status/:taskId', {
    schema: {
      tags: ['Task'],
      summary: 'Cek Status Task',
      description: 'Polling status task scraping asinkron. Gunakan `taskId` dari response `/search` atau `/product/details`.',
      params: {
        type: 'object',
        properties: {
          taskId: { type: 'string', format: 'uuid', description: 'Task ID dari response 202' },
        },
        required: ['taskId'],
      },
    },
  }, async (request, reply) => {
    const { taskId } = request.params;

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return reply.code(400).send(
        errorResponse('VALIDATION_ERROR', 'Invalid taskId format'),
      );
    }

    const status = await taskService.getStatus(taskId);

    if (!status) {
      return reply.code(404).send(
        errorResponse('TASK_NOT_FOUND', `Task ${taskId} not found`),
      );
    }

    const statusCode = status.status === 'FAILED' ? 200 : 200;

    return reply.code(statusCode).send(
      successResponse(status, { cached: false }),
    );
  });
};

export default taskRoute;
