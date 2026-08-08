'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Key, BookOpen,
  Settings, LogOut, Zap, ChevronRight,
} from 'lucide-react';
import { isAuthenticated, getCachedUser, logout, type AuthUser } from '../../lib/auth';

const navItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/docs', label: 'API Docs', icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const PLAN_COLORS: Record<string, string> = {
  FREE: '#9898b8',
  STARTER: '#22c55e',
  PRO: '#6366f1',
  ENTERPRISE: '#f59e0b',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const hoverZoneRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(getCachedUser());
  }, [router]);

  // Show sidebar when entering hover zone or sidebar itself
  const handleShowSidebar = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setSidebarVisible(true);
  };

  // Hide sidebar with a small delay so it doesn't flash away on gaps
  const handleHideSidebar = () => {
    hideTimerRef.current = setTimeout(() => setSidebarVisible(false), 200);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <Zap size={32} color="var(--accent)" style={{ marginBottom: '12px' }} />
          <div className="skeleton" style={{ width: '120px', height: '14px', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>

      {/* ── Invisible hover trigger zone (thin 16px strip on left edge only) ── */}
      <div
        ref={hoverZoneRef}
        onMouseEnter={handleShowSidebar}
        onMouseLeave={handleHideSidebar}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '16px',
          height: '100vh',
          zIndex: 55,
          pointerEvents: sidebarVisible ? 'none' : 'all',
        }}
      />

      {/* ── Backdrop (click outside to close) ── */}
      {sidebarVisible && (
        <div
          onClick={() => setSidebarVisible(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.15s ease',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleShowSidebar}
        onMouseLeave={handleHideSidebar}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '240px',
          height: '100vh',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: sidebarVisible ? '4px 0 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Link href="/dashboard/overview" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--accent-glow)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="var(--accent-bright)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>DataScrapper</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setSidebarVisible(false)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: 'var(--radius)',
                background: active ? 'var(--accent-glow)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                color: active ? 'var(--accent-bright)' : 'var(--text-secondary)',
                textDecoration: 'none', fontSize: '14px', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s ease',
              }}>
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: PLAN_COLORS[user.plan] ?? 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {user.plan}
              </div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '8px' }}>
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Edge indicator (tab visible when sidebar is hidden) ── */}
      <div
        onMouseEnter={handleShowSidebar}
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          transform: `translateY(-50%) translateX(${sidebarVisible ? '-100%' : '0'})`,
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 55,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '10px 4px',
          background: 'var(--bg-elevated)',
          borderRadius: '0 6px 6px 0',
          border: '1px solid var(--border)',
          borderLeft: 'none',
          cursor: 'pointer',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '2px', height: '16px',
            background: 'var(--accent)',
            borderRadius: '99px',
            opacity: 0.6 + i * 0.15,
          }} />
        ))}
      </div>

      {/* ── Main content (full width, no margin-left) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Topbar */}
        <header style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          {/* Menu hint button */}
          <button
            onMouseEnter={handleShowSidebar}
            onClick={() => setSidebarVisible(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              padding: '4px', borderRadius: '6px', transition: 'color 0.2s',
            }}
            title="Show menu"
          >
            <Zap size={18} color="var(--accent-bright)" />
          </button>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>DataScrapper</span>

          {/* Quota pill */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
              background: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.3)',
              color: 'var(--accent-bright)',
            }}>
              ⚡ {user.quotaLimit - user.quotaUsed} quota left
            </div>
            {/* Avatar */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer',
            }}
              onClick={() => setSidebarVisible(true)}
              title={user.name}
            >
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
