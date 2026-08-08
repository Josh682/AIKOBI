import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { registerUser, loginUser, refreshTokens, getCurrentUser } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ── Validation schemas ────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});

// ── Route plugin ──────────────────────────────────────────────
const authRoute: FastifyPluginAsync = async (fastify) => {

  // POST /api/v1/auth/register
  fastify.post('/api/v1/auth/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register pengguna baru',
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 8, example: 'SuperSecret123!' },
          name: { type: 'string', minLength: 2, example: 'Budi Santoso' },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(
        errorResponse('VALIDATION_ERROR', 'Invalid request body', parsed.error.issues),
      );
    }

    try {
      const { user, tokens } = await registerUser(parsed.data);
      return reply.code(201).send(
        successResponse({ user, tokens }, { message: 'Account created successfully' }),
      );
    } catch (err: unknown) {
      const e = err as { statusCode?: number; code?: string; message: string };
      return reply.code(e.statusCode ?? 500).send(
        errorResponse(e.code ?? 'INTERNAL_ERROR', e.message),
      );
    }
  });

  // POST /api/v1/auth/login
  fastify.post('/api/v1/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login dan dapatkan JWT',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'SuperSecret123!' },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(
        errorResponse('VALIDATION_ERROR', 'Invalid request body', parsed.error.issues),
      );
    }

    try {
      const { user, tokens } = await loginUser(parsed.data);
      return reply.send(successResponse({ user, tokens }));
    } catch (err: unknown) {
      const e = err as { statusCode?: number; code?: string; message: string };
      return reply.code(e.statusCode ?? 500).send(
        errorResponse(e.code ?? 'INTERNAL_ERROR', e.message),
      );
    }
  });

  // POST /api/v1/auth/refresh
  fastify.post('/api/v1/auth/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Refresh access token menggunakan refresh token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(
        errorResponse('VALIDATION_ERROR', 'refreshToken is required', parsed.error.issues),
      );
    }

    try {
      const tokens = await refreshTokens(parsed.data.refreshToken);
      return reply.send(successResponse(tokens));
    } catch (err: unknown) {
      const e = err as { statusCode?: number; code?: string; message: string };
      return reply.code(e.statusCode ?? 500).send(
        errorResponse(e.code ?? 'INTERNAL_ERROR', e.message),
      );
    }
  });

  // GET /api/v1/auth/me  (JWT protected — handled by jwt plugin hook)
  fastify.get('/api/v1/auth/me', {
    schema: {
      tags: ['Auth'],
      summary: 'Get current authenticated user',
      security: [{ BearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const user = await getCurrentUser(request.jwtUserId);
      return reply.send(successResponse(user));
    } catch (err: unknown) {
      const e = err as { statusCode?: number; code?: string; message: string };
      return reply.code(e.statusCode ?? 500).send(
        errorResponse(e.code ?? 'INTERNAL_ERROR', e.message),
      );
    }
  });
};

export default authRoute;
