import { prisma } from '@datascrapper/db';

// ── Usage stats for the current user ─────────────────────────
export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true, quotaLimit: true, quotaUsed: true, quotaResetAt: true,
    },
  });

  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'NOT_FOUND' });

  // Request counts over last 7 days (per day)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyLogs = await prisma.auditLog.groupBy({
    by: ['createdAt'],
    where: { userId, createdAt: { gte: sevenDaysAgo } },
    _count: { id: true },
  });

  // Active API key count
  const activeKeyCount = await prisma.apiKey.count({ where: { userId, isActive: true } });

  // Total requests all-time
  const totalRequests = await prisma.auditLog.count({ where: { userId } });

  // Success rate (statusCode < 400)
  const successfulRequests = await prisma.auditLog.count({
    where: { userId, statusCode: { lt: 400 } },
  });

  // Recent activity (last 20)
  const recentActivity = await prisma.auditLog.findMany({
    where: { userId },
    select: {
      id: true, endpoint: true, method: true, statusCode: true,
      durationMs: true, quotaCost: true, createdAt: true,
      apiKey: { select: { keyPrefix: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Scrape task summary
  const taskStats = await prisma.scrapeTask.groupBy({
    by: ['status'],
    where: {
      apiKeyId: {
        in: (await prisma.apiKey.findMany({ where: { userId }, select: { id: true } })).map((k: { id: string }) => k.id),
      },
    },
    _count: { id: true },
  });

  const taskSummary = taskStats.reduce((acc: Record<string, number>, s) => {
    acc[s.status] = s._count.id;
    return acc;
  }, {} as Record<string, number>);

  return {
    quota: {
      plan: user.plan,
      limit: user.quotaLimit,
      used: user.quotaUsed,
      remaining: Math.max(0, user.quotaLimit - user.quotaUsed),
      resetAt: user.quotaResetAt,
      percentUsed: user.quotaLimit > 0
        ? Math.round((user.quotaUsed / user.quotaLimit) * 100)
        : 0,
    },
    keys: {
      active: activeKeyCount,
    },
    requests: {
      total: totalRequests,
      successful: successfulRequests,
      failed: totalRequests - successfulRequests,
      successRate: totalRequests > 0
        ? Math.round((successfulRequests / totalRequests) * 100)
        : 100,
    },
    tasks: taskSummary,
    recentActivity,
  };
}
