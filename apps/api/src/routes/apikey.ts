import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  listApiKeys, createApiKey, updateApiKey, revokeApiKey, rotateApiKey,
} from '../services/apikey.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ── Schemas ───────────────────────────────────────────────────
const createKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(80).default('My API Key'),
});

const updateKeySchema = z.object({
  name: z.string().min(1).max(80).optional(),
  isActive: z.boolean().optional(),
}).refine(d => d.name !== undefined || d.isActive !== undefined, {
  message: 'At least one field (name or isActive) must be provided',
});

// ── Helper: catch service errors uniformly ───────────────────
async function handleService<T>(
  fn: () => Promise<T>,
  reply: { code: (n: number) => { send: (b: unknown) => unknown } },
): Promise<T | unknown> {
  try {
    return await fn();
  } catch (err: unknown) {
    const e = err as { statusCode?: number; code?: string; message: string };
    return reply.code(e.statusCode ?? 500).send(
      errorResponse(e.code ?? 'INTERNAL_ERROR', e.message),
    );
  }
}

// ── Route plugin ──────────────────────────────────────────────
const apiKeyRoute: FastifyPluginAsync = async (fastify) => {

  // GET /api/v1/keys — list all keys
  fastify.get('/api/v1/keys', {
    schema: {
      tags: ['API Keys'],
      summary: 'List API keys milik user yang terautentikasi',
      security: [{ BearerAuth: [] }],
    },
  }, async (request, reply) => {
    return handleService(async () => {
      const keys = await listApiKeys(request.jwtUserId);
      return reply.send(successResponse(keys, { total: keys.length }));
    }, reply);
  });

  // POST /api/v1/keys — create new key
  fastify.post('/api/v1/keys', {
    schema: {
      tags: ['API Keys'],
      summary: 'Buat API key baru (max 10 per user)',
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Production Key', default: 'My API Key' },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = createKeySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Invalid body', parsed.error.issues));
    }

    return handleService(async () => {
      const key = await createApiKey(request.jwtUserId, parsed.data.name);
      return reply.code(201).send(
        successResponse(key, { note: 'Save your rawKey — it will NOT be shown again.' }),
      );
    }, reply);
  });

  // PATCH /api/v1/keys/:id — update name / active status
  fastify.patch('/api/v1/keys/:id', {
    schema: {
      tags: ['API Keys'],
      summary: 'Update nama atau status API key',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateKeySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Invalid body', parsed.error.issues));
    }

    return handleService(async () => {
      const updated = await updateApiKey(request.jwtUserId, id, parsed.data);
      return reply.send(successResponse(updated));
    }, reply);
  });

  // DELETE /api/v1/keys/:id — revoke key
  fastify.delete('/api/v1/keys/:id', {
    schema: {
      tags: ['API Keys'],
      summary: 'Hapus (revoke) API key secara permanen',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return handleService(async () => {
      const result = await revokeApiKey(request.jwtUserId, id);
      return reply.send(successResponse(result));
    }, reply);
  });

  // POST /api/v1/keys/:id/rotate — rotate to a new key
  fastify.post('/api/v1/keys/:id/rotate', {
    schema: {
      tags: ['API Keys'],
      summary: 'Rotate API key — hapus lama, buat baru',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return handleService(async () => {
      const newKey = await rotateApiKey(request.jwtUserId, id);
      return reply.code(201).send(
        successResponse(newKey, { note: 'Old key is invalidated. Save your new rawKey.' }),
      );
    }, reply);
  });
};

export default apiKeyRoute;
