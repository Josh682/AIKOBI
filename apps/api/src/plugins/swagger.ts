import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'DataScrapper BaaS API',
        description: `
## DataScrapper — E-Commerce Data Extraction API

Layanan Backend-as-a-Service untuk mengambil data produk dari marketplace Indonesia secara real-time.

### Authentication
Semua endpoint (kecuali \`/health\` dan \`/api/v1/auth/*\`) membutuhkan API Key via header:
\`\`\`
X-API-Key: dsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

### Rate Limits
- **Free**: 10 req/menit
- **Starter**: 50 req/menit  
- **Pro**: 200 req/menit
- **Enterprise**: 1000 req/menit

### Response Format
Semua response menggunakan format standar:
\`\`\`json
{ "success": true, "data": {...}, "error": null, "meta": {...} }
\`\`\`
        `,
        version: '1.0.0',
        contact: {
          name: 'DataScrapper Support',
          email: 'support@datascrapper.dev',
        },
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API Key dari dashboard pengguna',
          },
        },
      },
      security: [{ ApiKeyAuth: [] }],
      tags: [
        { name: 'Health', description: 'System health check' },
        { name: 'Search', description: 'Pencarian produk' },
        { name: 'Product', description: 'Detail produk' },
        { name: 'Task', description: 'Status task asinkron' },
        { name: 'Auth', description: 'Autentikasi pengguna' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      defaultModelsExpandDepth: 3,
    },
    staticCSP: true,
    logo: {
      type: 'image/svg+xml',
      content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔍</text></svg>',
    },
  });
};

export default fp(swaggerPlugin, { name: 'swagger' });
