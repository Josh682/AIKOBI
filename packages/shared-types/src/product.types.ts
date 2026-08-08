// ======================================================
//  Product Data Types (normalized output from scrapers)
// ======================================================

import type { Marketplace } from './api.types.js';

export interface ProductVariant {
  name: string;          // e.g. "Merah - XL"
  price: number;         // in IDR (integer)
  originalPrice?: number; // before discount
  discountPercent?: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
}

export interface Review {
  author?: string;
  rating: number;        // 1-5
  content?: string;
  reviewDate?: string;   // ISO string
  helpful?: number;
}

export interface SellerInfo {
  name: string;
  url?: string;
  location?: string;
  rating?: number;
  totalSales?: number;
  isOfficial?: boolean;  // Official store badge
}

export interface SearchResultItem {
  externalId: string;
  marketplace: Marketplace;
  url: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  rating?: number;
  totalReviews?: number;
  totalSold?: number;
  seller?: SellerInfo;
  location?: string;
  badge?: string;       // e.g. "Terlaris", "Pilihan"
}

export interface SearchResult {
  keyword: string;
  marketplace: Marketplace;
  totalFound: number;
  page: number;
  perPage: number;
  items: SearchResultItem[];
}

export interface ProductDetail extends SearchResultItem {
  description?: string;
  category?: string;
  variants: ProductVariant[];
  reviews: Review[];
  specifications?: Record<string, string>;
  images: string[];
  minPrice: number;      // lowest variant price
  maxPrice: number;      // highest variant price
  totalStock: number;    // sum of all variants
  scrapedAt: string;     // ISO string
}

// Normalized price (string "Rp 1.500.000" -> number 1500000)
export interface NormalizedPrice {
  amount: number;
  currency: 'IDR';
  formatted: string;     // "Rp 1.500.000"
}
