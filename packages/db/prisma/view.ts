import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📦 DATA PRODUK HASIL SCRAPING DI DATABASE:');
  console.log('====================================================');
  
  const products = await prisma.product.findMany({
    select: {
      name: true,
      marketplace: true,
      rating: true,
      totalSold: true,
      seller: true,
      location: true,
      isOfficialStore: true,
    },
    take: 15,
  });

  if (products.length === 0) {
    console.log('Belum ada produk tersimpan. Jalankan scraping terlebih dahulu.');
  } else {
    console.table(products);
    console.log(`Total ditampilkan: ${products.length} produk.`);
  }

  console.log('\n💾 DATA SEARCH CACHE:');
  const cache = await prisma.searchCache.findMany({
    select: {
      keyword: true,
      marketplace: true,
      resultCount: true,
      expiresAt: true,
    },
    take: 5,
  });
  console.table(cache);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
