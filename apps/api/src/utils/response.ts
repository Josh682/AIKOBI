import type { ApiError, ApiResponse, ErrorCode, Pagination, ResponseMeta } from '@datascrapper/shared-types';

/**
 * Build a standardized success response
 */
export function successResponse<T>(
  data: T,
  meta?: Partial<ResponseMeta>,
  pagination?: Pagination,
): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: {
      cached: false,
      ...meta,
    },
    ...(pagination ? { pagination } : {}),
  };
}

/**
 * Build a standardized error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: unknown,
): ApiResponse<null> {
  const error: ApiError = { code, message, details };
  return {
    success: false,
    data: null,
    error,
  };
}
