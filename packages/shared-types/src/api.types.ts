// ======================================================
//  Standardized API Response Types
// ======================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ResponseMeta;
  pagination?: Pagination;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ResponseMeta {
  taskId?: string;
  cached: boolean;
  cacheExpiresAt?: string;
  marketplace?: Marketplace;
  scrapedAt?: string;
  responseTimeMs?: number;
  quotaRemaining?: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ======================================================
//  Request Types
// ======================================================

export type Marketplace = 'TOKOPEDIA' | 'SHOPEE' | 'BUKALAPAK' | 'LAZADA' | 'BLIBLI';

export interface SearchRequest {
  q: string;
  marketplace: Marketplace;
  min_price?: number;
  max_price?: number;
  page?: number;
  per_page?: number;
}

export interface ProductDetailRequest {
  url: string;
  marketplace: Marketplace;
  include_reviews?: boolean;
}

export interface TaskStatusRequest {
  taskId: string;
}

// ======================================================
//  Error Codes
// ======================================================

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_API_KEY'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'TASK_NOT_FOUND'
  | 'SCRAPE_FAILED'
  | 'CACHE_ERROR'
  | 'INTERNAL_ERROR'
  | 'MARKETPLACE_UNAVAILABLE';
