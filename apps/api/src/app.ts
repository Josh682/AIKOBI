import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// Plugins
import prismaPlugin from './plugins/prisma.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import jwtPlugin from './plugins/jwt.js';
import swaggerPlugin from './plugins/swagger.js';

// Routes
import healthRoute from './routes/health.js';
import searchRoute from './routes/search.js';
import productRoute from './routes/product.js';
import taskRoute from './routes/task.js';
import authRoute from './routes/auth.js';
import apiKeyRoute from './routes/apikey.js';
import statsRoute from './routes/stats.js';

export async function buildApp() {
  const app = Fastify({
    logger: false, // We use our own pino logger
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    ajv: {
      customOptions: {
        strict: 'log',          // Warn instead of throw on unknown keywords
        keywords: ['example'],  // Allow OpenAPI 'example' annotation
        unknownFormats: 'ignore',
      },
    },
  });

  // ─── Security & CORS ────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disabled for Swagger UI
  });

  await app.register(cors, {
    origin: env.NODE_ENV === 'production'
      ? [env.NEXT_PUBLIC_APP_URL]
      : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
  });

  // ─── Global Rate Limit ────────────────────────────────────
  await app.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req, context) => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again in ${context.after}`,
      },
      data: null,
    }),
  });

  // ─── Infrastructure Plugins ───────────────────────────────
  await app.register(swaggerPlugin);
  await app.register(prismaPlugin);
  await app.register(redisPlugin);

  // ─── Auth Hooks (runs after redis/prisma ready) ───────────
  await app.register(authPlugin);  // API Key auth (X-API-Key header)
  await app.register(jwtPlugin);   // JWT auth (Bearer token for dashboard)

  // ─── Request Logging Hook ────────────────────────────────
  app.addHook('onRequest', async (request) => {
    logger.debug({ method: request.method, url: request.url, ip: request.ip }, '→ Request');
  });

  app.addHook('onResponse', async (request, reply) => {
    logger.debug({ method: request.method, url: request.url, statusCode: reply.statusCode }, '← Response');
  });

  // ─── Public Routes ─────────────────────────────────────────
  await app.register(healthRoute);
  await app.register(authRoute);     // POST /api/v1/auth/*

  // ─── API Key Protected Routes ─────────────────────────────
  await app.register(searchRoute);
  await app.register(productRoute);
  await app.register(taskRoute);

  // ─── JWT Protected Routes (Dashboard) ────────────────────
  await app.register(apiKeyRoute);   // CRUD /api/v1/keys/*
  await app.register(statsRoute);    // GET /api/v1/stats/usage

  // ─── 404 Handler ─────────────────────────────────────────
  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
      data: null,
    });
  });

  // ─── Global Error Handler ─────────────────────────────────
  app.setErrorHandler((error, _request, reply) => {
    logger.error({ err: error }, 'Unhandled error');
    return reply.code(error.statusCode ?? 500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      },
      data: null,
    });
  });

  return app;
}
