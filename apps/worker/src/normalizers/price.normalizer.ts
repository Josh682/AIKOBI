/**
 * Price Normalizer
 * Converts Indonesian currency strings to plain numbers.
 * 
 * Examples:
 *   "Rp 1.500.000"  → 1500000
 *   "Rp1.200"       → 1200
 *   "1.000.000"     → 1000000
 *   "15rb"          → 15000
 *   "1,5jt"         → 1500000
 */
export function normalizePrice(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return Math.round(raw);

  let str = raw.toString().trim();
  if (!str) return 0;

  // Remove currency symbols
  str = str.replace(/Rp\.?\s*/gi, '');

  // Handle shorthand: "rb" = ribu (thousand), "jt" = juta (million)
  if (/jt/i.test(str)) {
    const num = parseFloat(str.replace(',', '.').replace(/jt.*/i, ''));
    return Math.round(num * 1_000_000);
  }
  if (/rb/i.test(str)) {
    const num = parseFloat(str.replace(',', '.').replace(/rb.*/i, ''));
    return Math.round(num * 1_000);
  }

  // Remove thousand separators (dots) and normalize decimal (commas)
  str = str.replace(/\./g, '').replace(',', '.');

  // Extract only the numeric part
  const match = str.match(/[\d.]+/);
  if (!match) return 0;

  return Math.round(parseFloat(match[0]));
}

/**
 * Calculate discount percentage
 */
export function calcDiscount(original: number, discounted: number): number {
  if (original <= 0 || discounted >= original) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

/**
 * Format number to IDR string
 */
export function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
