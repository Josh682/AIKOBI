import { prisma } from '@datascrapper/db';
import { Decimal } from '@prisma/client/runtime/library';
import type { PriceSnapshot } from '@datascrapper/shared-types';
import { logger } from './logger.js';

/**
 * Ambil harga terakhir produk dari tabel PriceHistory.
 * Dipakai untuk menghitung delta saat scraping baru masuk.
 */
export async function getLastPrice(productId: string): Promise<number | null> {
  const last = await prisma.priceHistory.findFirst({
    where: { productId },
    orderBy: { scrapedAt: 'desc' },
    select: { price: true },
  });
  return last ? Number(last.price) : null;
}

/**
 * Hitung delta dan persentase perubahan harga.
 * changeAmount negatif = harga turun, positif = harga naik.
 */
export function calculatePriceChange(
  oldPrice: number,
  newPrice: number,
): { changeAmount: number; changePercent: number } {
  const changeAmount = newPrice - oldPrice;
  const changePercent = oldPrice > 0
    ? parseFloat(((changeAmount / oldPrice) * 100).toFixed(2))
    : 0;
  return { changeAmount, changePercent };
}

/**
 * Cek apakah perubahan harga signifikan (melewati threshold %).
 * Default threshold: 1% — supaya perubahan kecil tetap tercatat.
 */
export function isPriceSignificantChange(
  oldPrice: number,
  newPrice: number,
  thresholdPercent = 1,
): boolean {
  if (oldPrice <= 0) return false;
  const { changePercent } = calculatePriceChange(oldPrice, newPrice);
  return Math.abs(changePercent) >= thresholdPercent;
}

/**
 * Buat entry PriceHistory baru.
 * Jika lastPrice tersedia, hitung dan simpan delta harga sekaligus.
 */
export async function createPriceHistoryEntry(
  snapshot: PriceSnapshot,
): Promise<void> {
  const { productId, price, priceDisc, priceChange, changePercent, sessionId } = snapshot;

  await prisma.priceHistory.create({
    data: {
      productId,
      price: new Decimal(price),
      priceDisc: priceDisc != null ? new Decimal(priceDisc) : null,
      priceChange: priceChange != null ? new Decimal(priceChange) : null,
      changePercent: changePercent ?? null,
      sessionId: sessionId ?? null,
    },
  });

  if (priceChange != null && Math.abs(priceChange) > 0) {
    logger.info(
      { productId, price, priceChange, changePercent },
      `📈 Price change detected: ${changePercent ?? 0 > 0 ? '+' : ''}${changePercent?.toFixed(2)}%`,
    );
  }
}

/**
 * High-level helper: ambil harga terakhir, hitung delta, simpan PriceHistory.
 * Mengembalikan apakah ada perubahan harga yang signifikan.
 */
export async function trackProductPrice(opts: {
  productId: string;
  newPrice: number;
  priceDisc?: number;
  sessionId?: string;
  significantThreshold?: number;
}): Promise<{ hasSignificantChange: boolean; changePercent: number | null }> {
  const { productId, newPrice, priceDisc, sessionId, significantThreshold = 1 } = opts;

  const lastPrice = await getLastPrice(productId);
  let priceChange: number | undefined;
  let changePercent: number | undefined;
  let hasSignificantChange = false;

  if (lastPrice !== null) {
    const delta = calculatePriceChange(lastPrice, newPrice);
    priceChange = delta.changeAmount;
    changePercent = delta.changePercent;
    hasSignificantChange = isPriceSignificantChange(lastPrice, newPrice, significantThreshold);
  }

  await createPriceHistoryEntry({
    productId,
    price: newPrice,
    priceDisc,
    priceChange,
    changePercent,
    sessionId,
  });

  return { hasSignificantChange, changePercent: changePercent ?? null };
}
