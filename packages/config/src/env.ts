import { z } from 'zod';

// ======================================================
//  Environment Variable Schema Validation
// ======================================================

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  WORKER_CONCURRENCY: z.coerce.number().default(3),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis URL').default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Scraping
  PROXY_LIST: z.string().optional(),
  BROWSER_HEADLESS: z.string().transform(v => v !== 'false').default('true'),
  MAX_CONCURRENT_JOBS: z.coerce.number().default(3),
  CACHE_TTL_HOURS: z.coerce.number().default(24),

  // Payment
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.string().transform(v => v === 'true').default('false'),

  TRIPAY_API_KEY: z.string().optional(),
  TRIPAY_PRIVATE_KEY: z.string().optional(),
  TRIPAY_MERCHANT_CODE: z.string().optional(),
  TRIPAY_IS_PRODUCTION: z.string().transform(v => v === 'true').default('false'),

  // Frontend
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 * Throws a helpful error if required vars are missing.
 */
export function parseEnv(env: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.issues
      .map(i => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`❌ Invalid environment variables:\n${errors}`);
  }
  return result.data;
}

/**
 * Parse proxy list from comma-separated string
 */
export function parseProxyList(proxyList?: string): string[] {
  if (!proxyList || proxyList.trim() === '') return [];
  return proxyList.split(',').map(p => p.trim()).filter(Boolean);
}
