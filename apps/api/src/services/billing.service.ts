import { prisma } from '@datascrapper/db';
import { env } from '../config/env.js';
import { PLANS, type PlanId } from '@datascrapper/config';
import crypto from 'crypto';

// ── Midtrans Snap API base URLs ───────────────────────────────
const MIDTRANS_BASE = env.MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1';

function midtransAuthHeader(): string {
  const encoded = Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString('base64');
  return `Basic ${encoded}`;
}

// ── Create a Snap payment token ───────────────────────────────
export async function createTopUpTransaction(userId: string, planId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, plan: true },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'NOT_FOUND' });

  const plan = PLANS[planId as PlanId];
  if (!plan) throw Object.assign(new Error('Invalid plan'), { statusCode: 400, code: 'INVALID_PLAN' });
  if (plan.priceMonthly === 0) throw Object.assign(new Error('Free plan does not require payment'), { statusCode: 400, code: 'FREE_PLAN' });

  const externalId = `DSK-${userId.slice(0, 8)}-${Date.now()}`;

  // Create transaction record first
  const txn = await prisma.transaction.create({
    data: {
      userId,
      type: 'SUBSCRIPTION',
      amount: plan.priceMonthly,
      status: 'PENDING',
      externalId,
      paymentGateway: 'midtrans',
      quotaAdded: plan.quotaRequests,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
    },
  });

  // Development mock — no real Midtrans keys yet
  if (!env.MIDTRANS_SERVER_KEY || env.MIDTRANS_SERVER_KEY.startsWith('SB-Mid-server-xxx')) {
    return {
      transaction: txn,
      snapToken: 'SANDBOX_MOCK_TOKEN',
      snapUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock`,
      isMock: true,
    };
  }

  // Call Midtrans Snap API
  const payload = {
    transaction_details: {
      order_id: externalId,
      gross_amount: plan.priceMonthly,
    },
    customer_details: {
      first_name: user.name ?? 'User',
      email: user.email,
    },
    item_details: [
      {
        id: plan.id,
        price: plan.priceMonthly,
        quantity: 1,
        name: `DataScrapper ${plan.name} Plan (1 Bulan)`,
      },
    ],
    callbacks: {
      finish: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
      error: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=error`,
      pending: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=pending`,
    },
  };

  const response = await fetch(`${MIDTRANS_BASE}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: midtransAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json() as { error_messages?: string[] };
    throw Object.assign(
      new Error(err.error_messages?.[0] ?? 'Midtrans error'),
      { statusCode: 502, code: 'PAYMENT_GATEWAY_ERROR' },
    );
  }

  const { token: snapToken, redirect_url: snapUrl } = await response.json() as { token: string; redirect_url: string };

  // Save snap token to transaction
  await prisma.transaction.update({
    where: { id: txn.id },
    data: { snapToken, paymentUrl: snapUrl },
  });

  return { transaction: txn, snapToken, snapUrl, isMock: false };
}

// ── Handle Midtrans webhook notification ───────────────────────
export async function handleMidtransWebhook(notification: Record<string, string>) {
  const {
    order_id: orderId,
    transaction_status: txnStatus,
    fraud_status: fraudStatus,
    signature_key: sigKey,
    gross_amount: grossAmount,
    status_code: statusCode,
  } = notification;

  // Verify signature: SHA512(orderId + statusCode + grossAmount + serverKey)
  if (env.MIDTRANS_SERVER_KEY && !env.MIDTRANS_SERVER_KEY.startsWith('SB-Mid-server-xxx')) {
    const expected = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`)
      .digest('hex');
    if (expected !== sigKey) {
      throw Object.assign(new Error('Invalid webhook signature'), { statusCode: 401, code: 'INVALID_SIGNATURE' });
    }
  }

  // Find transaction
  const txn = await prisma.transaction.findFirst({ where: { externalId: orderId } });
  if (!txn) throw Object.assign(new Error('Transaction not found'), { statusCode: 404, code: 'NOT_FOUND' });

  // Determine new status
  let newStatus: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' = 'PENDING';
  if (txnStatus === 'capture' && fraudStatus === 'accept') newStatus = 'PAID';
  else if (txnStatus === 'settlement') newStatus = 'PAID';
  else if (['cancel', 'deny', 'failure'].includes(txnStatus)) newStatus = 'FAILED';
  else if (txnStatus === 'expire') newStatus = 'EXPIRED';

  await prisma.transaction.update({
    where: { id: txn.id },
    data: {
      status: newStatus,
      paidAt: newStatus === 'PAID' ? new Date() : undefined,
    },
  });

  // If paid: upgrade user plan + reset quota
  if (newStatus === 'PAID') {
    const plan = PLANS[txn.metadata as unknown as PlanId];
    if (plan) {
      const quotaResetAt = new Date();
      quotaResetAt.setMonth(quotaResetAt.getMonth() + 1);

      await prisma.user.update({
        where: { id: txn.userId },
        data: {
          plan: plan.id as PlanId,
          quotaLimit: plan.quotaRequests,
          quotaUsed: 0,
          quotaResetAt,
        },
      });
    }
  }

  return { status: newStatus, transactionId: txn.id };
}

// ── Get transaction history ───────────────────────────────────
export async function getTransactionHistory(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  return { transactions, total, page, pages: Math.ceil(total / limit) };
}
