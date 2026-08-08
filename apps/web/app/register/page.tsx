'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Check } from 'lucide-react';
import { register } from '../../lib/auth';

const perks = [
  '100 request gratis per bulan',
  'Akses ke Tokopedia & Shopee API',
  'Tanpa kartu kredit',
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      router.push('/dashboard/overview');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message: string } } } })
        ?.response?.data?.error?.message ?? 'Registrasi gagal. Coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--bg-base)',
    }}>
      <div style={{
        position: 'fixed', top: '20%', right: '25%',
        width: '500px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'var(--accent-glow)', border: '1px solid var(--accent)',
            borderRadius: '12px', padding: '10px 18px', marginBottom: '20px',
          }}>
            <Zap size={20} color="var(--accent-bright)" />
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent-bright)' }}>DataScrapper</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>Buat akun gratis</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Mulai scraping data marketplace dalam hitungan menit
          </p>
        </div>

        {/* Perks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {perks.map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Check size={10} color="var(--success)" strokeWidth={3} />
              </div>
              {p}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--danger)', fontSize: '13px',
              }}>{error}</div>
            )}

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Nama Lengkap
              </label>
              <input className="input" id="name" type="text" placeholder="Budi Santoso"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input className="input" id="reg-email" type="email" placeholder="user@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Password <span style={{ color: 'var(--text-muted)' }}>(min. 8 karakter)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input className="input" id="reg-password" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} autoComplete="new-password" style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="register-submit" type="submit" className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px' }}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loading ? 'Membuat akun...' : 'Buat Akun Gratis'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 500 }}>
              Masuk
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
