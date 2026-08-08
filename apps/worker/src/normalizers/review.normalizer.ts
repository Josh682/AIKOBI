/**
 * Review Normalizer
 * Cleans and normalizes review/rating data from scraped HTML.
 */

/**
 * Normalize rating to a 1-5 integer
 * Handles: "4.8", "4,8", "4.8/5", 4.8, "⭐⭐⭐⭐" (4 stars)
 */
export function normalizeRating(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return Math.min(5, Math.max(1, Math.round(raw)));

  const str = raw.toString().trim();
  if (!str) return 0;

  // Handle "4.8/5" or "4.8 dari 5"
  const fractionMatch = str.match(/([\d.,]+)\s*(?:\/|dari)\s*5/i);
  if (fractionMatch) {
    return Math.round(parseFloat(fractionMatch[1]!.replace(',', '.')));
  }

  // Handle star emoji (⭐ or ★)
  const starCount = (str.match(/[⭐★]/g) || []).length;
  if (starCount > 0) return Math.min(5, starCount);

  // Plain number
  const num = parseFloat(str.replace(',', '.'));
  if (!isNaN(num)) {
    // If > 5, assume it's out of 10 (normalize to 5)
    return num > 5 ? Math.round((num / 10) * 5) : Math.round(num);
  }

  return 0;
}

/**
 * Normalize review count string
 * "1.2rb ulasan" → 1200, "500+" → 500, "1.000" → 1000
 */
export function normalizeReviewCount(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return Math.max(0, raw);

  const str = raw.toString().toLowerCase().trim();
  if (!str) return 0;

  // Handle "rb" = ribu (thousand)
  if (/rb/i.test(str)) {
    const num = parseFloat(str.replace(',', '.').replace(/rb.*/i, ''));
    return Math.round(num * 1_000);
  }

  // Remove non-numeric chars except dots/commas
  const cleaned = str.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.');
  if (!cleaned) return 0;

  return Math.max(0, parseInt(cleaned, 10));
}

/**
 * Clean review text: remove HTML tags, trim excessive whitespace
 */
export function cleanReviewText(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, '') // strip HTML
    .replace(/\s+/g, ' ')    // collapse whitespace
    .trim();
}

/**
 * Normalize "sold" count
 * "1rb terjual" → 1000, "500+ terjual" → 500
 */
export function normalizeSoldCount(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return Math.max(0, raw);

  const str = raw.toString().toLowerCase().trim();

  if (/rb/i.test(str) || /k/i.test(str)) {
    const num = parseFloat(str.replace(',', '.').replace(/[^\d.]/g, ''));
    return Math.round(num * 1_000);
  }

  if (/jt/i.test(str)) {
    const num = parseFloat(str.replace(',', '.').replace(/[^\d.]/g, ''));
    return Math.round(num * 1_000_000);
  }

  const cleaned = str.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}
