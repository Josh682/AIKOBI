import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@datascrapper/db';
import { env } from '../config/env.js';
import type { JwtPayload } from '../plugins/jwt.js';

const SALT_ROUNDS = 12;

// ── Token pair type ───────────────────────────────────────────
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// ── Generate token pair ───────────────────────────────────────
function generateTokens(userId: string, email: string, plan: string): TokenPair {
  const basePayload = { sub: userId, email, plan };

  const accessToken = jwt.sign(
    { ...basePayload, type: 'access' } satisfies JwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );

  const refreshToken = jwt.sign(
    { ...basePayload, type: 'refresh' } satisfies JwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );

  return { accessToken, refreshToken, expiresIn: env.JWT_EXPIRES_IN };
}

// ── Register ──────────────────────────────────────────────────
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw Object.assign(new Error('Email already in use'), { statusCode: 409, code: 'EMAIL_TAKEN' });
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
    },
    select: { id: true, email: true, name: true, plan: true, quotaLimit: true, quotaUsed: true, createdAt: true },
  });

  const tokens = generateTokens(user.id, user.email, user.plan);
  return { user, tokens };
}

// ── Login ─────────────────────────────────────────────────────
export async function loginUser(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true, email: true, name: true, plan: true,
      quotaLimit: true, quotaUsed: true, passwordHash: true,
      isActive: true, createdAt: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account is suspended'), { statusCode: 403, code: 'ACCOUNT_SUSPENDED' });
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  const { passwordHash: _, ...safeUser } = user;
  const tokens = generateTokens(user.id, user.email, user.plan);
  return { user: safeUser, tokens };
}

// ── Refresh ───────────────────────────────────────────────────
export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401, code: 'INVALID_TOKEN' });
  }

  if (payload.type !== 'refresh') {
    throw Object.assign(new Error('Token type mismatch'), { statusCode: 401, code: 'INVALID_TOKEN' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, plan: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw Object.assign(new Error('User not found or suspended'), { statusCode: 401, code: 'UNAUTHORIZED' });
  }

  return generateTokens(user.id, user.email, user.plan);
}

// ── Get current user ──────────────────────────────────────────
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, plan: true,
      quotaLimit: true, quotaUsed: true, quotaResetAt: true,
      isActive: true, createdAt: true, updatedAt: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }
  return user;
}
