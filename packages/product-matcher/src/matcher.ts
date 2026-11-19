import {
  checkAttributeCompatibility,
  extractProductAttributes,
  type ExtractedProductAttributes,
} from './attribute-extractor.js';
import { computeSemanticSimilarity } from './embedder.js';
import { normalizeProductTitle } from './normalizer.js';

export interface RawMarketplaceProduct {
  id?: string | number;
  name: string;
  priceInt?: number;
  price?: number;
  url?: string;
  ratingAverage?: string | number | null;
  rating?: number | null;
  shop?: {
    name?: string;
    city?: string;
  };
  seller?: string;
  city?: string;
  location?: string;
}

export interface MatchedCompetitor {
  nama: string;
  toko: string;
  city: string;
  harga: number;
  price: number;
  rating: number;
  url: string;
  similarityScore: number;
  matchedAttributes: ExtractedProductAttributes;
}

export interface MatchCompetitorsOptions {
  basePrice?: number;
  targetCity?: string;
  minSimilarity?: number;
  madThreshold?: number;
  maxResults?: number;
}

export interface OutlierFilterOptions {
  madThreshold?: number;
  minRatioToMedian?: number;
  maxRatioToMedian?: number;
}

function computeMedian(sortedValues: number[]): number {
  const n = sortedValues.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid];
}

/**
 * Non-circular statistical outlier filter operating in log-price space using
 * Median Absolute Deviation (MAD) computed exclusively over the matched candidate set.
 * Completely independent of the user's store price (`basePrice`).
 */
export function filterPriceOutliersMAD<T extends { price: number }>(
  items: T[],
  options: OutlierFilterOptions = {},
): T[] {
  const validItems = items.filter((item) => Number.isFinite(item.price) && item.price > 0);
  if (validItems.length < 3) {
    return validItems;
  }

  const madThreshold = options.madThreshold ?? 2.5;
  const minRatio = options.minRatioToMedian ?? 0.3;
  const maxRatio = options.maxRatioToMedian ?? 3.0;

  const logPrices = validItems.map((item) => Math.log(item.price));
  const sortedLogPrices = [...logPrices].sort((a, b) => a - b);
  const medianLog = computeMedian(sortedLogPrices);
  const medianPrice = Math.exp(medianLog);

  const absDeviations = logPrices.map((lp) => Math.abs(lp - medianLog));
  const sortedDeviations = [...absDeviations].sort((a, b) => a - b);
  const madLog = computeMedian(sortedDeviations);

  // Consistent estimator for normal std: 1.4826 * MAD, floored at 0.32 in log-space
  const sigmaLog = Math.max(madLog * 1.4826, 0.32);

  const filtered = validItems.filter((item, idx) => {
    const zRobust = absDeviations[idx] / sigmaLog;
    return (
      zRobust <= madThreshold &&
      item.price >= medianPrice * minRatio &&
      item.price <= medianPrice * maxRatio
    );
  });

  // Safety guard: never return empty if valid items exist unless everything was extreme
  return filtered.length > 0 ? filtered : validItems;
}

/**
 * Matches marketplace search candidates against a target product title using:
 * 1. Structured attribute extraction & hard compatibility gates
 * 2. 384-dim semantic embedding cosine similarity + concept overlap
 * 3. Non-circular log-price MAD outlier filtering
 */
export function matchAndFilterCompetitors(
  targetTitle: string,
  rawProducts: RawMarketplaceProduct[],
  options: MatchCompetitorsOptions = {},
): MatchedCompetitor[] {
  const targetAttrs = extractProductAttributes(targetTitle);
  const minSimilarity = options.minSimilarity ?? 0.68;
  const maxResults = options.maxResults ?? 35;

  const candidatesWithAttributes: MatchedCompetitor[] = [];
  const seenNormalizedNames = new Set<string>();

  for (const p of rawProducts) {
    const rawPrice = p.priceInt ?? p.price ?? 0;
    if (!Number.isFinite(rawPrice) || rawPrice <= 0 || !p.name) {
      continue;
    }

    const normKey = normalizeProductTitle(p.name).cleanCoreTitle || p.name.toLowerCase().trim();
    if (seenNormalizedNames.has(normKey)) {
      continue;
    }

    const candAttrs = extractProductAttributes(p.name);
    const compat = checkAttributeCompatibility(targetAttrs, candAttrs);
    if (!compat.compatible) {
      continue;
    }

    const rawSim = computeSemanticSimilarity(targetTitle, p.name);
    const compositeScore = Math.max(0, Math.min(1, rawSim - compat.penaltyScore));
    if (compositeScore < minSimilarity) {
      continue;
    }

    seenNormalizedNames.add(normKey);

    const parsedRating =
      typeof p.rating === 'number'
        ? p.rating
        : typeof p.ratingAverage === 'number'
          ? p.ratingAverage
          : typeof p.ratingAverage === 'string'
            ? parseFloat(p.ratingAverage)
            : NaN;

    const city = p.shop?.city || p.city || p.location || 'Jakarta';
    const sellerName = p.shop?.name || p.seller || 'Tokopedia Seller';

    candidatesWithAttributes.push({
      nama: p.name,
      toko: sellerName,
      city,
      harga: rawPrice,
      price: rawPrice,
      rating: Number.isFinite(parsedRating) && parsedRating > 0 ? parsedRating : 4.8,
      url:
        p.url ||
        `https://www.tokopedia.com/search?q=${encodeURIComponent(targetAttrs.searchQuery || targetTitle)}`,
      similarityScore: Math.round(compositeScore * 1000) / 1000,
      matchedAttributes: candAttrs,
    });
  }

  // Non-circular outlier filtering over the compatible & semantically similar pool
  const cleanCandidates = filterPriceOutliersMAD(candidatesWithAttributes, {
    madThreshold: options.madThreshold ?? 2.5,
  });

  // Sort by semantic similarity descending (preserve relative order for ties)
  cleanCandidates.sort((a, b) => b.similarityScore - a.similarityScore);

  return cleanCandidates.slice(0, maxResults);
}
