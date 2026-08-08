import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/response.js';

// ── JWT Payload ────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;   // userId
  email: string;
  plan: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// ── Extend Fastify's request with JWT context ──────────────────
declare module 'fastify' {
  interface FastifyRequest {
    jwtUserId: string;
    jwtEmail: string;
    jwtPlan: string;
  }
  interface FastifyInstance {
    signJwt: (payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn?: string) => string;
    verifyJwt: (token: string) => JwtPayload;
  }
}

// ── Helper: extract Bearer token ───────────────────────────────
function extractBearer(request: FastifyRequest): string | null {
  const auth = request.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  // ── Decorate instance with sign/verify helpers ───────────────
  fastify.decorate('signJwt', (payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn?: string) => {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: (expiresIn ?? (payload.type === 'refresh' ? env.JWT_REFRESH_EXPIRES_IN : env.JWT_EXPIRES_IN)) as jwt.SignOptions['expiresIn'],
    });
  });

  fastify.decorate('verifyJwt', (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  });

  // ── Hook: protect JWT-guarded routes ────────────────────────
  // Routes that start with /api/v1/keys, /api/v1/stats, /api/v1/billing require JWT
  fastify.addHook('onRequest', async (request, reply) => {
    const jwtRoutes = [
      '/api/v1/keys',
      '/api/v1/stats',
      '/api/v1/billing',
      '/api/v1/auth/me',
    ];

    const needsJwt = jwtRoutes.some(r => request.url.startsWith(r));
    if (!needsJwt) return;

    const token = extractBearer(request);
    if (!token) {
      return reply.code(401).send(
        errorResponse('UNAUTHORIZED', 'Missing Authorization header (Bearer token required)'),
      );
    }

    try {
      const payload = fastify.verifyJwt(token);
      if (payload.type !== 'access') {
        return reply.code(401).send(
          errorResponse('UNAUTHORIZED', 'Invalid token type — use access token'),
        );
      }
      request.jwtUserId = payload.sub;
      request.jwtEmail = payload.email;
      request.jwtPlan = payload.plan;
    } catch {
      return reply.code(401).send(
        errorResponse('UNAUTHORIZED', 'Invalid or expired token'),
      );
    }
  });
};

export default fp(jwtPlugin, { name: 'jwt' });
