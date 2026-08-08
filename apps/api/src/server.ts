import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function start() {
  const app = await buildApp();

  try {
    const address = await app.listen({
      port: env.API_PORT,
      host: env.API_HOST,
    });

    logger.info(`🚀 DataScrapper API running at ${address}`);
    logger.info(`📚 Swagger docs: ${address}/documentation`);
    logger.info(`🏥 Health check: ${address}/health`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
  } catch (err) {
    logger.error({ err }, '❌ Failed to start server');
    process.exit(1);
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise rejection');
  process.exit(1);
});

start();
