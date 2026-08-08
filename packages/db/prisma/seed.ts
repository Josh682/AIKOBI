import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateApiKey(): { key: string; prefix: string } {
  const raw = `dsk_${randomBytes(32).toString('hex')}`;
  const prefix = raw.substring(0, 12);
  return { key: raw, prefix };
}

async function main() {
  console.log('🌱 Seeding database...');

  const TEST_PASSWORD = 'Test1234!';
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  const { key, prefix } = generateApiKey();

  const user = await prisma.user.upsert({
    where: { email: 'test@datascrapper.dev' },
    update: {
      passwordHash, // update hash setiap seed
    },
    create: {
      email: 'test@datascrapper.dev',
      passwordHash,
      name: 'Test User',
      plan: 'FREE',
      quotaLimit: 100,
      quotaUsed: 0,
      apiKeys: {
        create: {
          key,
          keyPrefix: prefix,
          name: 'Test API Key',
          isActive: true,
        },
      },
    },
  });

  console.log('');
  console.log('✅ Test user siap:');
  console.log(`   Email   : test@datascrapper.dev`);
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log('');
  console.log(`🔑 API Key: ${key}`);
  console.log(`   (simpan key ini — tidak akan ditampilkan lagi)`);
  console.log('');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
