import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ── Axios instance ────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Auth token injection ──────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config;
    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken });
        const { accessToken } = data.data;
        localStorage.setItem('access_token', accessToken);
        originalReq.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalReq);
      } catch {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ── Typed API helpers ─────────────────────────────────────────

export const authApi = {
  register: (body: { email: string; password: string; name: string }) =>
    apiClient.post('/api/v1/auth/register', body),
  login: (body: { email: string; password: string }) =>
    apiClient.post('/api/v1/auth/login', body),
  refresh: (refreshToken: string) =>
    apiClient.post('/api/v1/auth/refresh', { refreshToken }),
  me: () => apiClient.get('/api/v1/auth/me'),
};

export const keysApi = {
  list: () => apiClient.get('/api/v1/keys'),
  create: (name: string) => apiClient.post('/api/v1/keys', { name }),
  update: (id: string, data: { name?: string; isActive?: boolean }) =>
    apiClient.patch(`/api/v1/keys/${id}`, data),
  revoke: (id: string) => apiClient.delete(`/api/v1/keys/${id}`),
  rotate: (id: string) => apiClient.post(`/api/v1/keys/${id}/rotate`),
};

export const statsApi = {
  usage: () => apiClient.get('/api/v1/stats/usage'),
};
