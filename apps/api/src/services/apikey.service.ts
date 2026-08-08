import { randomBytes, createHash } from 'crypto';
import { prisma } from '@datascrapper/db';

const KEY_PREFIX = 'dsk_';

// ── Generate a new random API key ────────────────────────────
function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(32).toString('base64url');
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

function getKeyPrefix(rawKey: string): string {
  // Show first 12 chars in UI: "dsk_XXXXXXXX"
  return rawKey.slice(0, 12);
}

// ── List all keys for a user ──────────────────────────────────
export async function listApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      keyPrefix: true,
      name: true,
      isActive: true,
      lastUsedAt: true,
      usageCount: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ── Create a new API key ──────────────────────────────────────
export async function createApiKey(userId: string, name: string): Promise<{
  id: string;
  rawKey: string;  // Only returned once at creation time
  keyPrefix: string;
  name: string;
  createdAt: Date;
}> {
  // Limit: max 10 active keys per user
  const activeCount = await prisma.apiKey.count({
    where: { userId, isActive: true },
  });
  if (activeCount >= 10) {
    throw Object.assign(new Error('Maximum of 10 active API keys reached'), { statusCode: 400, code: 'KEY_LIMIT_REACHED' });
  }

  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      key: rawKey,   // Store raw key (hashed lookup in auth plugin)
      keyPrefix,
      name,
    },
    select: { id: true, keyPrefix: true, name: true, createdAt: true },
  });

  return { ...apiKey, rawKey };
}

// ── Update key name / active status ──────────────────────────
export async function updateApiKey(userId: string, keyId: string, data: {
  name?: string;
  isActive?: boolean;
}) {
  const key = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });
  if (!key) {
    throw Object.assign(new Error('API key not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    select: { id: true, keyPrefix: true, name: true, isActive: true, updatedAt: true },
  });
}

// ── Revoke (delete) a key ─────────────────────────────────────
export async function revokeApiKey(userId: string, keyId: string) {
  const key = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });
  if (!key) {
    throw Object.assign(new Error('API key not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  await prisma.apiKey.delete({ where: { id: keyId } });
  return { message: 'API key revoked successfully' };
}

// ── Rotate: delete old, create new ───────────────────────────
export async function rotateApiKey(userId: string, keyId: string) {
  const oldKey = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });
  if (!oldKey) {
    throw Object.assign(new Error('API key not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  // Atomic: delete old + create new in a transaction
  const [, newKey] = await prisma.$transaction([
    prisma.apiKey.delete({ where: { id: keyId } }),
    prisma.apiKey.create({
      data: {
        userId,
        key: rawKey,
        keyPrefix,
        name: `${oldKey.name} (rotated)`,
      },
      select: { id: true, keyPrefix: true, name: true, createdAt: true },
    }),
  ]);

  return { ...newKey, rawKey };
}
