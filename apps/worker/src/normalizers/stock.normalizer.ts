/**
 * Stock Normalizer
 * Converts stock string representations to plain integers.
 *
 * Examples:
 *   "Stok: 234"     → 234
 *   "Sisa 5"        → 5
 *   "234 tersedia"  → 234
 *   "Habis"         → 0
 *   "Ready"         → 999   (stock unknown but available)
 *   "> 500"         → 500
 *   "1.000"         → 1000
 */
export function normalizeStock(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return Math.max(0, Math.round(raw));

  const str = raw.toString().trim().toLowerCase();
  if (!str) return 0;

  // Out of stock indicators
  const outOfStockPatterns = ['habis', 'sold out', 'tidak tersedia', 'kosong', 'stok habis'];
  if (outOfStockPatterns.some(p => str.includes(p))) return 0;

  // Available without exact count
  const availablePatterns = ['ready', 'tersedia', 'ada', 'in stock'];
  if (availablePatterns.some(p => str === p)) return 999;

  // Remove non-numeric prefixes
  const cleaned = str
    .replace(/stok\s*:/i, '')
    .replace(/sisa\s*/i, '')
    .replace(/>\s*/, '')
    .replace(/tersedia/i, '')
    .replace(/\./g, '') // thousand separators
    .trim();

  // Extract first number found
  const match = cleaned.match(/\d+/);
  if (!match) return 0;

  return Math.max(0, parseInt(match[0], 10));
}

/**
 * Determine if a product is available based on stock string
 */
export function isAvailable(raw: string | number | null | undefined): boolean {
  return normalizeStock(raw) > 0;
}
