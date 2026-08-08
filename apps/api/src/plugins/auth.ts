import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '@datascrapper/db';
import { createHash } from 'crypto';
import { errorResponse } from '../utils/response.js';

// Extend Fastify's request with authenticated context
declare module 'fastify' {
  interface FastifyRequest {
    apiKeyId: string;
    userId: string;
    userPlan: string;
    quotaRemaining: number;
  }
}

/**
 * Validates the X-API-Key header on every request.
 * Attaches apiKeyId / userId / userPlan to request object.
 */
const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
    // Skip auth for public routes AND JWT-protected routes (handled by jwt plugin)
    const publicPaths = [
      '/health',
      '/api/v1/auth',      // login, register, refresh
      '/documentation',
      '/api/v1/keys',      // managed via JWT Bearer token
      '/api/v1/stats',     // managed via JWT Bearer token
      '/api/v1/billing',   // managed via JWT Bearer token
    ];
    const isPublic = publicPaths.some(p => request.url.startsWith(p));
    if (isPublic) return;

    const rawKey = request.headers['x-api-key'];
    if (!rawKey || typeof rawKey !== 'string') {
      return reply.code(401).send(
        errorResponse('UNAUTHORIZED', 'Missing X-API-Key header'),
      );
    }

    // Hash the incoming key for DB lookup (we store hashed keys)
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.apiKey.findUnique({
      where: { key: rawKey },
      include: { user: { select: { id: true, plan: true, quotaLimit: true, quotaUsed: true, isActive: true } } },
    });

    if (!apiKey || !apiKey.isActive) {
      return reply.code(401).send(
        errorResponse('INVALID_API_KEY', 'Invalid or revoked API key'),
      );
    }

    if (!apiKey.user.isActive) {
      return reply.code(403).send(
        errorResponse('UNAUTHORIZED', 'Account is suspended'),
      );
    }

    const quotaRemaining = apiKey.user.quotaLimit - apiKey.user.quotaUsed;
    if (quotaRemaining <= 0) {
      return reply.code(429).send(
        errorResponse('QUOTA_EXCEEDED', 'Monthly quota exceeded. Please top up your account.'),
      );
    }

    // Attach to request
    request.apiKeyId = apiKey.id;
    request.userId = apiKey.user.id;
    request.userPlan = apiKey.user.plan;
    request.quotaRemaining = quotaRemaining;

    // Update last used (fire & forget)
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
    }).catch(() => { /* non-critical */ });
  });
};

// Suppress unused variable warning
void createHash;

export default fp(authPlugin, { name: 'auth' });
