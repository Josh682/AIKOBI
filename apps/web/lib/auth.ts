'use client';

import { authApi } from './api-client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  quotaLimit: number;
  quotaUsed: number;
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await authApi.login({ email, password });
  const { user, tokens } = data.data;
  saveTokens(tokens.accessToken, tokens.refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<AuthUser> {
  const { data } = await authApi.register({ email, password, name });
  const { user, tokens } = data.data;
  saveTokens(tokens.accessToken, tokens.refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

export function logout() {
  clearTokens();
  window.location.href = '/login';
}

export function getCachedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
