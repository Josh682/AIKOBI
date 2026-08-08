'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Copy, Trash2, RotateCcw, Check, Eye, EyeOff,
  Key, AlertTriangle, Loader2, Power,
} from 'lucide-react';
import { keysApi } from '../../../lib/api-client';

interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  isActive: boolean;
  lastUsedAt: string | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface NewKeyResult {
  id: string;
  rawKey: string;
  keyPrefix: string;
  name: string;
  createdAt: string;
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
  const [copied, setCopied] = useState('');
  const [actionLoading, setActionLoading] = useState<string>('');

  async function fetchKeys() {
    try {
      const { data } = await keysApi.list();
      setKeys(data.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  useEffect(() => { fetchKeys(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await keysApi.create(newKeyName || 'My API Key');
      setNewKey(data.data);
      setShowForm(false);
      setNewKeyName('');
      await fetchKeys();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message: string } } } })
        ?.response?.data?.error?.message ?? 'Gagal membuat key';
      alert(msg);
    } finally { setCreating(false); }
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`Hapus key "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionLoading(id + '-revoke');
    try {
      await keysApi.revoke(id);
      await fetchKeys();
    } finally { setActionLoading(''); }
  }

  async function handleRotate(id: string) {
    if (!confirm('Rotate key ini? Key lama akan langsung tidak berlaku.')) return;
    setActionLoading(id + '-rotate');
    try {
      const { data } = await keysApi.rotate(id);
      setNewKey(data.data);
      await fetchKeys();
    } finally { setActionLoading(''); }
  }

  async function handleToggle(key: ApiKey) {
    setActionLoading(key.id + '-toggle');
    try {
      await keysApi.update(key.id, { isActive: !key.isActive });
      await fetchKeys();
    } finally { setActionLoading(''); }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>API Keys</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Kelola kunci API untuk autentikasi request
          </p>
        </div>
        <button onClick={() => setShowForm(f => !f)} className="btn btn-primary" id="create-key-btn">
          <Plus size={16} />
          Buat Key Baru
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Buat API Key Baru</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Nama Key
              </label>
              <input className="input" id="key-name-input" placeholder="Production Key"
                value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} id="confirm-create-key">
              {creating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
              {creating ? 'Membuat...' : 'Buat'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Batal</button>
          </form>
        </div>
      )}

      {/* New key reveal */}
      {newKey && (
        <div style={{
          padding: '16px 20px', borderRadius: 'var(--radius-lg)',
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertTriangle size={16} color="var(--warning)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)' }}>
              Simpan key ini sekarang — tidak akan ditampilkan lagi!
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
            <code className="mono" style={{ flex: 1, fontSize: '13px', color: 'var(--success)', wordBreak: 'break-all' }}>
              {newKey.rawKey}
            </code>
            <button onClick={() => copyToClipboard(newKey.rawKey, 'newkey')} className="btn btn-ghost" style={{ padding: '6px 10px', flexShrink: 0 }}>
              {copied === 'newkey' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} style={{ marginTop: '10px', fontSize: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            Saya sudah menyimpannya ✓
          </button>
        </div>
      )}

      {/* Keys list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '8px' }} />)}
          </div>
        ) : keys.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Key size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>Belum ada API key. Buat yang pertama!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus size={14} />
              Buat Key Pertama
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Nama', 'Key Prefix', 'Status', 'Penggunaan', 'Terakhir Dipakai', 'Dibuat', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{key.name}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <code className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>
                        {key.keyPrefix}...
                      </code>
                      <button onClick={() => copyToClipboard(key.keyPrefix, key.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {copied === key.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${key.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {key.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{key.usageCount.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>{formatDate(key.lastUsedAt)}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>{formatDate(key.createdAt)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleToggle(key)} className="btn btn-ghost" title={key.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        style={{ padding: '6px 8px' }}
                        disabled={actionLoading === key.id + '-toggle'}>
                        {actionLoading === key.id + '-toggle'
                          ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                          : <Power size={13} color={key.isActive ? 'var(--warning)' : 'var(--success)'} />}
                      </button>
                      <button onClick={() => handleRotate(key.id)} className="btn btn-ghost" title="Rotate key"
                        style={{ padding: '6px 8px' }}
                        disabled={actionLoading === key.id + '-rotate'}>
                        {actionLoading === key.id + '-rotate'
                          ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                          : <RotateCcw size={13} />}
                      </button>
                      <button onClick={() => handleRevoke(key.id, key.name)} className="btn btn-danger" title="Hapus"
                        style={{ padding: '6px 8px' }}
                        disabled={actionLoading === key.id + '-revoke'}>
                        {actionLoading === key.id + '-revoke'
                          ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Usage hint */}
      <div className="card-elevated" style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Cara penggunaan:</strong> Sertakan header{' '}
        <code className="mono" style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-bright)' }}>
          X-API-Key: {'<your-key>'}
        </code>{' '}
        di setiap request API ke endpoint yang diproteksi.
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
