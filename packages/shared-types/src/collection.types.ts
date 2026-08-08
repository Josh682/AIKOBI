// ======================================================
//  Collection Types (Price Optimizer — Scheduled Scraping)
// ======================================================

import type { Marketplace } from './api.types.js';

export type CollectionType = 'KEYWORD_SEARCH' | 'PRODUCT_TRACK';
export type CollectionStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * Konfigurasi sebuah CollectionPlan yang disimpan di DB.
 * Mendefinisikan apa yang di-scrape, kapan, dan seberapa sering.
 */
export interface CollectionPlanConfig {
  id: string;
  name: string;
  type: CollectionType;
  marketplace: Marketplace;

  // Untuk KEYWORD_SEARCH
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  maxPages?: number;

  // Untuk PRODUCT_TRACK
  productUrls?: string[];

  // Schedule
  cronExpr: string;  // Cron expression, e.g. "0 */6 * * *"
  isActive: boolean;
  nextRunAt?: string; // ISO string
}

/**
 * Summary sebuah CollectionSession setelah selesai.
 * Dipakai untuk logging dan monitoring.
 */
export interface CollectionSessionSummary {
  id: string;
  planId: string;
  planName: string;
  status: CollectionStatus;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  productsFound: number;
  priceChanges: number;
  startedAt: string;   // ISO string
  completedAt?: string; // ISO string
  durationMs?: number;
}

/**
 * Event yang di-emit ketika ada perubahan harga signifikan pada sebuah produk.
 * Dapat di-consume oleh AI module untuk analisis tren.
 */
export interface PriceChangeEvent {
  productId: string;
  productName: string;
  marketplace: Marketplace;
  productUrl: string;
  oldPrice: number;
  newPrice: number;
  changeAmount: number;   // newPrice - oldPrice (negatif = turun)
  changePercent: number;  // % perubahan
  sessionId: string;
  detectedAt: string;     // ISO string
}

/**
 * Snapshot harga produk yang disimpan ke PriceHistory.
 */
export interface PriceSnapshot {
  productId: string;
  price: number;
  priceDisc?: number;     // Harga setelah diskon (jika ada)
  priceChange?: number;   // Delta dari harga sebelumnya
  changePercent?: number; // % perubahan
  sessionId?: string;
}
