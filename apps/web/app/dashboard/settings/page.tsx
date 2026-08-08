'use client';

import { useEffect, useState } from 'react';
import { User, Shield, Trash2, Loader2 } from 'lucide-react';
import { getCachedUser, logout, type AuthUser } from '../../../lib/auth';
import { authApi } from '../../../lib/api-client';

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free (100 req/bulan)',
  STARTER: 'Starter (5.000 req/bulan)',
  PRO: 'Pro (25.000 req/bulan)',
  ENTERPRISE: 'Enterprise (100.000 req/bulan)',
};

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) setUser(cached);

    authApi.me().then(({ data }) => {
      setUser(data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Pengaturan Akun</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Kelola profil dan preferensi akun Anda
        </p>
      </div>

      {/* Profile card */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <User size={16} color="var(--accent-bright)" />
          <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Profil</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[140, 200, 100].map(w => <div key={w} className="skeleton" style={{ height: '16px', width: `${w}px` }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Row label="Nama" value={user?.name ?? '—'} />
            <Row label="Email" value={user?.email ?? '—'} />
            <Row label="Plan" value={PLAN_LABELS[user?.plan ?? 'FREE'] ?? user?.plan ?? '—'} />
            <Row label="Member sejak" value={user ? new Date(user.id.substring(0, 8) ? new Date().toISOString() : '').toLocaleDateString('id-ID') : '—'} />
          </div>
        )}
      </div>

      {/* Security card */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="var(--info)" />
          <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Keamanan</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Untuk mengubah password atau data akun, hubungi dukungan kami.
        </p>
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--bg-elevated)', fontSize: '13px', color: 'var(--text-secondary)' }}>
          🔐 Autentikasi berbasis JWT dengan refresh token 30 hari
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: '24px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={16} color="var(--danger)" />
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)' }}>Danger Zone</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Tindakan di bawah ini bersifat permanen dan tidak dapat dikembalikan.
        </p>
        <button onClick={logout} className="btn btn-danger" style={{ alignSelf: 'flex-start' }}>
          Keluar dari Semua Sesi
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
