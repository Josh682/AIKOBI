// ======================================================
//  BullMQ Job Payload Types
// ======================================================

import type { Marketplace } from './api.types.js';

export type TaskType = 'SEARCH' | 'PRODUCT_DETAIL' | 'REVIEWS';
export type TaskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// Base payload every job carries
export interface BaseJobPayload {
  taskId: string;
  apiKeyId: string;
  userId: string;
  marketplace: Marketplace;
  requestedAt: string; // ISO string
}

// Search job
export interface SearchJobPayload extends BaseJobPayload {
  type: 'SEARCH';
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  perPage: number;
}

// Product detail job
export interface ProductDetailJobPayload extends BaseJobPayload {
  type: 'PRODUCT_DETAIL';
  url: string;
  includeReviews: boolean;
  competitorKeyword?: string;
  competitorUrls?: string[];
  isAnalyze?: boolean;
}

// Reviews job
export interface ReviewsJobPayload extends BaseJobPayload {
  type: 'REVIEWS';
  productUrl: string;
  page: number;
}

// Union type for all job payloads
export type JobPayload = SearchJobPayload | ProductDetailJobPayload | ReviewsJobPayload;

// Job result
export interface JobResult<T = unknown> {
  taskId: string;
  status: TaskStatus;
  data?: T;
  error?: string;
  completedAt?: string;
}

// ── Collection Job Payloads (Price Optimizer — Scheduled Scraping) ────────────

export interface CollectionSearchJobPayload {
  sessionId: string;
  planId: string;
  marketplace: Marketplace;
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;         // Halaman saat ini
  maxPages: number;     // Batas halaman yang akan di-scrape
}

export interface CollectionProductJobPayload {
  sessionId: string;
  planId: string;
  marketplace: Marketplace;
  url: string;
  trackPriceChange: boolean; // Hitung delta harga dari snapshot terakhir
}

