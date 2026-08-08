'use client';

import { useEffect, useState } from 'react';
import { Activity, Key, Zap, TrendingUp, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { statsApi } from '../../../lib/api-client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Stats {
  quota: { plan: string; limit: number; used: number; remaining: number; percentUsed: number; resetAt: string };
  keys: { active: number };
  requests: { total: number; successful: number; failed: number; successRate: number };
  tasks: Record<string, number>;
  recentActivity: Array<{
    id: string; endpoint: string; method: string; statusCode: number;
    durationMs: number | null; quotaCost: number; createdAt: string;
    apiKey: { keyPrefix: string; name: string } | null;
  }>;
}

const PLAN_LABELS: Record<string, string> = { FREE: 'Free', STARTER: 'Starter', PRO: 'Pro', ENTERPRISE: 'Enterprise' };
const PLAN_COLORS: Record<string, string> = { FREE: '#9898b8', STARTER: '#22c55e', PRO: '#6366f1', ENTERPRISE: '#f59e0b' };

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function QuotaBar({ used, limit, percent }: { used: number; limit: number; percent: number }) {
  const color = percent >= 90 ? 'var(--danger)' : percent >= 70 ? 'var(--warning)' : 'var(--accent)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        <span>{used.toLocaleString()} digunakan</span>
        <span>{limit.toLocaleString()} total</span>
      </div>
      <div style={{ height: '6px', borderRadius: '99px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(percent, 100)}%`, borderRadius: '99px', background: color, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>{percent}% terpakai</div>
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchStats() {
    try {
      const { data } = await statsApi.usage();
      setStats(data.data);
      setLastUpdated(new Date());
    } catch {
      // handled silently — user sees skeleton
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  // Build sparkline data from recentActivity (group by last 7 days)
  const sparkData = stats?.recentActivity.slice(0, 14).reverse().map((a, i) => ({
    name: i + 1,
    requests: 1,
    success: a.statusCode < 400 ? 1 : 0,
  })) ?? [];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="skeleton" style={{ height: '32px', width: '200px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '16px' }} />)}
        </div>
        <div className="skeleton" style={{ height: '240px', borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Overview</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Monitor penggunaan API Anda secara real-time
          </p>
        </div>
        <button onClick={fetchStats} className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px' }}>
          <RefreshCw size={14} />
          {lastUpdated ? `${lastUpdated.toLocaleTimeString('id-ID')}` : 'Refresh'}
        </button>
      </div>

      {/* Plan badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Plan aktif:</span>
        <span style={{
          padding: '3px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
          background: `${PLAN_COLORS[stats?.quota.plan ?? 'FREE']}18`,
          color: PLAN_COLORS[stats?.quota.plan ?? 'FREE'],
          border: `1px solid ${PLAN_COLORS[stats?.quota.plan ?? 'FREE']}30`,
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          {PLAN_LABELS[stats?.quota.plan ?? 'FREE']}
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard title="Quota Tersisa" value={stats?.quota.remaining.toLocaleString() ?? '—'}
          sub={`dari ${stats?.quota.limit.toLocaleString()} total`}
          icon={Zap} color="var(--accent)" />
        <StatCard title="Total Request" value={stats?.requests.total.toLocaleString() ?? '—'}
          sub="sepanjang waktu" icon={Activity} color="var(--info)" />
        <StatCard title="Success Rate" value={`${stats?.requests.successRate ?? 100}%`}
          sub={`${stats?.requests.successful} berhasil`} icon={TrendingUp} color="var(--success)" />
        <StatCard title="API Keys Aktif" value={stats?.keys.active ?? 0}
          sub="key yang berjalan" icon={Key} color="var(--warning)" />
      </div>

      {/* Quota progress + Activity chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
        {/* Quota detail */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Penggunaan Quota</h2>
          <QuotaBar
            used={stats?.quota.used ?? 0}
            limit={stats?.quota.limit ?? 100}
            percent={stats?.quota.percentUsed ?? 0}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Reset:{' '}
            {stats?.quota.resetAt
              ? new Date(stats.quota.resetAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'}
          </div>

          {/* Task summary */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Status Tugas Scraping</div>
            {Object.entries(stats?.tasks ?? {}).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status.toLowerCase()}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            ))}
            {!Object.keys(stats?.tasks ?? {}).length && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Belum ada tugas</span>
            )}
          </div>
        </div>

        {/* Mini chart */}
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Aktivitas Terbaru</h2>
          {sparkData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Belum ada data aktivitas
            </div>
          )}
        </div>
      </div>

      {/* Recent activity table */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Log Aktivitas Terakhir</h2>
        {stats?.recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Belum ada request. Coba endpoint <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>GET /api/v1/search</code> dengan API key Anda.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Endpoint', 'Method', 'Status', 'Durasi', 'Quota', 'Waktu'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.recentActivity.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{a.endpoint}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '11px' }}>{a.method}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {a.statusCode < 400
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '12px' }}><CheckCircle size={12} />{a.statusCode}</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '12px' }}><XCircle size={12} />{a.statusCode}</span>
                      }
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px' }}>{a.durationMs ? `${a.durationMs}ms` : '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px' }}>{a.quotaCost}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        {new Date(a.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
