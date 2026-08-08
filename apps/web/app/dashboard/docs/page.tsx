'use client';

import { ExternalLink, BookOpen, Terminal, Key, Zap, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/search',
    desc: 'Cari produk di marketplace',
    params: '?marketplace=tokopedia&q=laptop&page=1',
    color: '#22c55e',
  },
  {
    method: 'GET',
    path: '/api/v1/product/details',
    desc: 'Detail produk berdasarkan URL',
    params: '?marketplace=shopee&url=...',
    color: '#22c55e',
  },
  {
    method: 'GET',
    path: '/api/v1/task/:taskId',
    desc: 'Cek status job scraping async',
    params: '',
    color: '#22c55e',
  },
  {
    method: 'GET',
    path: '/api/v1/keys',
    desc: 'List semua API key milik akun',
    params: '',
    color: '#22c55e',
    jwt: true,
  },
  {
    method: 'POST',
    path: '/api/v1/keys',
    desc: 'Buat API key baru',
    params: '',
    color: '#6366f1',
    jwt: true,
  },
  {
    method: 'POST',
    path: '/api/v1/auth/register',
    desc: 'Daftar akun baru',
    params: '',
    color: '#6366f1',
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    desc: 'Login dan dapatkan JWT',
    params: '',
    color: '#6366f1',
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: copied ? 'var(--success)' : 'var(--text-muted)',
      display: 'flex', alignItems: 'center', padding: '2px',
      transition: 'color 0.2s',
    }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function DocsPage() {
  const curlExample = `curl "${API_URL}/api/v1/search?marketplace=tokopedia&q=laptop" \\
  -H "X-API-Key: dsk_your_api_key_here"`;

  const jsExample = `const res = await fetch(
  "${API_URL}/api/v1/search?marketplace=tokopedia&q=laptop",
  { headers: { "X-API-Key": "dsk_your_api_key_here" } }
);
const { data } = await res.json();`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>API Dokumentasi</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Referensi endpoint dan cara pakai DataScrapper API
          </p>
        </div>
        <a
          href={`${API_URL}/documentation`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '14px', flexShrink: 0 }}
        >
          <BookOpen size={15} />
          Buka Swagger UI
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Auth info */}
      <div className="card" style={{ padding: '20px', borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Key size={16} color="var(--accent-bright)" />
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Autentikasi</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
          Semua endpoint scraping memerlukan <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', color: 'var(--accent-bright)' }}>X-API-Key</code> header.
          Endpoint manajemen akun (<code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>/keys</code>, <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>/stats</code>) menggunakan JWT Bearer token.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            Scraping: <code style={{ color: 'var(--text-secondary)' }}>X-API-Key: dsk_xxx</code>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
            Dashboard: <code style={{ color: 'var(--text-secondary)' }}>Authorization: Bearer eyJxxx</code>
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={15} color="var(--accent-bright)" />
          Contoh Cepat
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* cURL */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>cURL</span>
              <CopyButton text={curlExample} />
            </div>
            <pre style={{ padding: '16px', fontSize: '11.5px', lineHeight: 1.7, color: '#a8b5c9', margin: 0, overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{curlExample}</pre>
          </div>
          {/* JavaScript */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>JavaScript</span>
              <CopyButton text={jsExample} />
            </div>
            <pre style={{ padding: '16px', fontSize: '11.5px', lineHeight: 1.7, color: '#a8b5c9', margin: 0, overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{jsExample}</pre>
          </div>
        </div>
      </div>

      {/* Endpoints list */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={15} color="var(--accent-bright)" />
          Semua Endpoint
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {endpoints.map((ep, i) => (
            <div key={ep.path + ep.method} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 20px',
              borderBottom: i < endpoints.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{
                minWidth: '52px', textAlign: 'center',
                padding: '3px 8px', borderRadius: '4px',
                fontSize: '11px', fontWeight: 700,
                background: ep.method === 'GET' ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                color: ep.method === 'GET' ? '#22c55e' : '#818cf8',
                fontFamily: 'monospace',
              }}>{ep.method}</span>
              <code style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>
                {ep.path}
                {ep.params && <span style={{ color: 'var(--text-muted)' }}>{ep.params}</span>}
              </code>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{ep.desc}</span>
              {ep.jwt && (
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                  background: 'rgba(99,102,241,0.1)', color: 'var(--accent-bright)',
                  border: '1px solid rgba(99,102,241,0.2)', whiteSpace: 'nowrap',
                }}>JWT</span>
              )}
              {!ep.jwt && ep.path.includes('/api/v1/search') || (!ep.jwt && ep.path.includes('/product')) || (!ep.jwt && ep.path.includes('/task')) ? (
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                  background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.2)', whiteSpace: 'nowrap',
                }}>X-API-Key</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Open Swagger CTA */}
      <div className="card" style={{ padding: '24px', textAlign: 'center', borderStyle: 'dashed' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Untuk test interaktif lengkap, buka Swagger UI di tab baru
        </p>
        <a
          href={`${API_URL}/documentation`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <BookOpen size={15} />
          Buka Swagger UI di Tab Baru
          <ExternalLink size={13} />
        </a>
      </div>

    </div>
  );
}
