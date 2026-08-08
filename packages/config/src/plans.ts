// ======================================================
//  Subscription Plan Definitions
// ======================================================

export type PlanId = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;      // in IDR
  quotaRequests: number;     // monthly request quota
  rateLimit: number;         // requests per minute
  maxApiKeys: number;
  cacheAccess: boolean;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    priceMonthly: 0,
    quotaRequests: 100,
    rateLimit: 10,
    maxApiKeys: 1,
    cacheAccess: true,
    supportLevel: 'community',
    features: [
      '100 requests/bulan',
      '1 API Key',
      'Cache data 24 jam',
      'Tokopedia & Shopee',
      'Komunitas support',
    ],
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    priceMonthly: 99_000,
    quotaRequests: 5_000,
    rateLimit: 50,
    maxApiKeys: 3,
    cacheAccess: true,
    supportLevel: 'email',
    features: [
      '5.000 requests/bulan',
      '3 API Keys',
      'Cache data 48 jam',
      'Semua marketplace',
      'Email support',
      'Akses Swagger docs',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    priceMonthly: 299_000,
    quotaRequests: 25_000,
    rateLimit: 200,
    maxApiKeys: 10,
    cacheAccess: true,
    supportLevel: 'priority',
    features: [
      '25.000 requests/bulan',
      '10 API Keys',
      'Cache data 48 jam',
      'Semua marketplace',
      'Priority support',
      'Webhook notifikasi',
      'Export CSV/JSON',
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    priceMonthly: 999_000,
    quotaRequests: 100_000,
    rateLimit: 1_000,
    maxApiKeys: 50,
    cacheAccess: true,
    supportLevel: 'dedicated',
    features: [
      '100.000 requests/bulan',
      '50 API Keys',
      'Cache data 72 jam',
      'Semua marketplace',
      'Dedicated support',
      'Custom webhook',
      'SLA 99.9%',
      'IP Whitelist',
    ],
  },
};

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
