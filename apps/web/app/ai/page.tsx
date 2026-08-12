'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AiPage() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('Memulai live scraping link Tokopedia...');
  const [progressPct, setProgressPct] = useState<number>(15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Force clean empty state on every mount / page load
  useEffect(() => {
    setUrlInput('');
    setData(null);
    setErrorMsg(null);
  }, []);

  const runAnalysis = async (inputUrl: string) => {
    setErrorMsg(null);
    const cleanUrl = inputUrl.trim();

    if (!cleanUrl) {
      setErrorMsg('⚠️ Masukkan link produk Tokopedia terlebih dahulu.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMsg('⚠️ Link tidak valid. Harap masukkan link Tokopedia yang valid (contoh: https://www.tokopedia.com/store/produk)');
      return;
    }

    setLoading(true);
    setData(null);
    setStatusStep('Menghubungkan ke Tokopedia Live Scraper...');
    setProgressPct(30);

    try {
      setStatusStep('Mengekstrak data dari link Tokopedia...');
      setProgressPct(60);

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        const errorText = json?.error || '⚠️ Link Tokopedia tidak valid atau produk sudah tidak aktif (404 Not Found). Silakan periksa kembali link yang Anda masukkan.';
        setErrorMsg(errorText);
        setLoading(false);
        return;
      }

      setStatusStep('Menjalankan Inferensi Model AIMA (AI Market Analyzer)...');
      setProgressPct(90);
      setData(json.data);

    } catch (err: any) {
      setErrorMsg(err.message || '⚠️ Link Tokopedia tidak valid atau produk sudah tidak aktif.');
    } finally {
      setProgressPct(100);
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div
            className="brand-mark"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            AI
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' }}>AIMA</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>AI Market Analyzer</span>
          </div>
        </div>
        <nav>
          <Link href="/">Beranda</Link>
          <Link href="/ai" className="active">Analisis AI</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>
      </header>

      <main className="page" style={{ paddingTop: '0px', paddingBottom: '60px', paddingLeft: '0px', paddingRight: '0px' }}>
        <section className="ai-hero" style={{ marginTop: '0px', marginBottom: '36px', marginLeft: '0px', marginRight: '0px' }}>
          <p className="eyebrow" style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Riset Pasar Tokopedia Real-time
          </p>
          <h1>Tempel link produk Tokopedia untuk analisis AIMA</h1>

          <form
            className="ai-search"
            onSubmit={(e) => {
              e.preventDefault();
              runAnalysis(urlInput);
            }}
            style={{ display: 'flex', gap: '12px' }}
          >
            <input
              type="text"
              key="clean-url-input"
              value={urlInput}
              autoComplete="off"
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste link produk Tokopedia (contoh: https://www.tokopedia.com/...)"
              style={{ flex: '1' }}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Menganalisis...' : 'Analisis'}
            </button>
          </form>
        </section>

        {loading && (
          <div className="empty-state" style={{ paddingTop: '40px', paddingBottom: '40px', paddingLeft: '40px', paddingRight: '40px', background: 'var(--surface)', borderRadius: 'var(--radius)', marginTop: '0px', marginBottom: '32px', marginLeft: '0px', marginRight: '0px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--indigo)', marginTop: '0px', marginBottom: '14px', marginLeft: '0px', marginRight: '0px' }}>
              ⚙️ {statusStep}
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface-sunken)', borderRadius: '4px', overflow: 'hidden', maxWidth: '440px', marginTop: '0px', marginBottom: '0px', marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--green)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="empty-state" style={{ color: '#B4443A', background: '#F7E6E3', border: '1px solid #EAEFE6', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '12px', marginTop: '0px', marginBottom: '32px', marginLeft: '0px', marginRight: '0px', textAlign: 'left', fontWeight: 500, fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        {!loading && !data && !errorMsg && (
          <div className="empty-state" style={{ paddingTop: '64px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px', background: 'var(--surface)', borderRadius: 'var(--radius)', color: 'var(--ink-soft)' }}>
            <div style={{ fontSize: '32px', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px' }}>🔗</div>
            <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--ink)', marginTop: '0px', marginBottom: '8px', marginLeft: '0px', marginRight: '0px' }}>Siap Menganalisis Produk Tokopedia</div>
            <div style={{ fontSize: '14.5px', color: 'var(--ink-faint)', textAlign: 'justify', maxWidth: '540px', marginTop: '0px', marginBottom: '0px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
              Silakan tempel link produk Tokopedia pada kolom di atas untuk mendapatkan riset penetapan harga komprehensif.
            </div>
          </div>
        )}

        {data && !loading && (
          <>
            <section className="rec-card" style={{ paddingTop: '32px', paddingBottom: '32px', paddingLeft: '36px', paddingRight: '36px', marginTop: '0px', marginBottom: '38px', marginLeft: '0px', marginRight: '0px', borderRadius: '18px', boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
              <div className="rec-top" style={{ marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px' }}>
                <div>
                  <div className="rec-title" style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', marginTop: '0px', marginBottom: '4px', marginLeft: '0px', marginRight: '0px' }}>
                    {data.kategori}
                  </div>
                  <h2 className="rec-product" style={{ fontSize: '23px', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                    {data.produk}
                  </h2>
                </div>
                <span className={`badge ${data.status}`}>
                  {data.status === 'murah' ? 'Murah' : data.status === 'mahal' ? 'Mahal' : 'Wajar'}
                </span>
              </div>

              <div className="rec-prices" style={{ marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px', gap: '28px' }}>
                <div className="rec-price-block">
                  <div className="label" style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', marginTop: '0px', marginBottom: '4px', marginLeft: '0px', marginRight: '0px' }}>Harga Toko Anda</div>
                  <div className="value tabular" style={{ fontSize: '25px', fontWeight: 800 }}>Rp {data.harga_toko.toLocaleString('id-ID')}</div>
                  {data.info_varian && data.info_varian.ada_varian && (
                    <div style={{ marginTop: '8px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', fontSize: '12.5px', background: '#FEF3C7', color: '#B45309', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '6px', fontWeight: 700, border: '1px solid #FDE68A', display: 'inline-block' }}>
                      📌 Produk Multi-Varian: Rentang Rp {data.info_varian.min_varian.toLocaleString('id-ID')} - Rp {data.info_varian.max_varian.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
                <div className="rec-price-block">
                  <div className="label" style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', marginTop: '0px', marginBottom: '4px', marginLeft: '0px', marginRight: '0px' }}>Harga Rata-rata Pasar</div>
                  <div className="value market tabular" style={{ fontSize: '25px', fontWeight: 800 }}>Rp {data.harga_pasar.toLocaleString('id-ID')}</div>
                </div>
                <div className="confidence-wrap">
                  <div className="label" style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', marginTop: '0px', marginBottom: '4px', marginLeft: '0px', marginRight: '0px' }}>Confidence AI</div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: `${data.confidence}%` }}></div>
                  </div>
                  <div className="gauge-pct" style={{ marginTop: '4px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>{data.confidence}% confidence</div>
                </div>
              </div>

              <div className="rec-note" style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#1E293B', fontWeight: 500, paddingTop: '18px', paddingBottom: '18px', paddingLeft: '24px', paddingRight: '24px', background: '#F8FAFC', borderLeft: '4px solid #3B82F6', borderRadius: '10px', textAlign: 'justify', marginTop: '24px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px' }}>
                {data.rekomendasi}
              </div>

              {(() => {
                const rhw = data.rentang_harga_wajar || {};
                const minP = rhw.min_pasar ?? rhw.min ?? data.harga_toko;
                const maxP = rhw.max_pasar ?? rhw.max ?? data.harga_toko;
                const wMin = rhw.wajar_min ?? Math.round(data.harga_pasar * 0.85);
                const wMax = rhw.wajar_max ?? Math.round(data.harga_pasar * 1.15);
                const shopP = data.harga_toko;
                const meanP = data.harga_pasar;

                // Scale bounds for progress track visualization
                const totalRange = maxP - minP || 1;
                const getPct = (val: number) => Math.min(94, Math.max(6, ((val - minP) / totalRange) * 100));

                const shopPct = getPct(shopP);
                const meanPct = getPct(meanP);
                const wMinPct = getPct(wMin);
                const wMaxPct = getPct(wMax);

                return (
                  <div style={{ marginTop: '28px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', background: '#F8FAFC', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0px', marginBottom: '16px', marginLeft: '0px', marginRight: '0px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '19px' }}>⚖️</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Rentang Harga Wajar Pasar</span>
                      </div>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, background: rhw.is_inside_zone ? '#F0FDF4' : '#FFFBEB', color: rhw.is_inside_zone ? '#15803D' : '#B45309', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '6px', border: rhw.is_inside_zone ? '1px solid #BBF7D0' : '1px solid #FDE68A' }}>
                        {rhw.status_zone || 'Zona Penetapan Harga'}
                      </span>
                    </div>

                    {/* Scale Track Container */}
                    <div style={{ position: 'relative', height: '48px', marginTop: '46px', marginBottom: '44px', marginLeft: '0px', marginRight: '0px', background: '#E2E8F0', borderRadius: '24px', paddingTop: '4px', paddingBottom: '4px', paddingLeft: '4px', paddingRight: '4px' }}>
                      {/* Far Left Min Price Label */}
                      <span style={{ position: 'absolute', left: '14px', top: '14px', fontSize: '12.5px', fontWeight: 800, color: '#475569', zIndex: 1 }}>
                        Rp {minP.toLocaleString('id-ID')}
                      </span>

                      {/* Far Right Max Price Label */}
                      <span style={{ position: 'absolute', right: '14px', top: '14px', fontSize: '12.5px', fontWeight: 800, color: '#475569', zIndex: 1 }}>
                        Rp {maxP.toLocaleString('id-ID')}
                      </span>

                      {/* Fair Zone Highlighted Band (Clean Gradient) */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${wMinPct}%`,
                          width: `${Math.max(10, wMaxPct - wMinPct)}%`,
                          top: '0',
                          bottom: '0',
                          background: 'linear-gradient(90deg, #86EFAC 0%, #4ADE80 50%, #86EFAC 100%)',
                          borderRadius: '24px',
                          boxShadow: '0 0 12px rgba(74, 222, 128, 0.4)'
                        }}
                      />

                      {/* Mean Price Vertical Line Marker (Extends UPWARD further to badge) */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${meanPct}%`,
                          top: '-18px',
                          bottom: '0',
                          width: '3.5px',
                          background: '#2563EB',
                          borderRadius: '2px 2px 0 0',
                          zIndex: 3
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: `${meanPct}%`,
                          transform: 'translateX(-50%)',
                          top: '-42px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          color: '#1D4ED8',
                          background: '#EFF6FF',
                          paddingTop: '3px',
                          paddingBottom: '3px',
                          paddingLeft: '9px',
                          paddingRight: '9px',
                          borderRadius: '6px',
                          border: '1.5px solid #BFDBFE',
                          whiteSpace: 'nowrap',
                          zIndex: 4,
                          boxShadow: '0 2px 8px rgba(37,99,235,0.18)'
                        }}
                      >
                        Rata-rata: Rp {meanP.toLocaleString('id-ID')}
                      </div>

                      {/* Shop Price Vertical Line Marker (Extends DOWNWARD further to badge) */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${shopPct}%`,
                          top: '0',
                          bottom: '-18px',
                          width: '3.5px',
                          background: '#0F172A',
                          borderRadius: '0 0 2px 2px',
                          zIndex: 5,
                          boxShadow: '0 0 5px rgba(15, 23, 42, 0.45)'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: `${shopPct}%`,
                          transform: 'translateX(-50%)',
                          bottom: '-46px',
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#0F172A',
                          background: '#FFFFFF',
                          paddingTop: '4px',
                          paddingBottom: '4px',
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          borderRadius: '6px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
                          border: '1.5px solid #0F172A',
                          whiteSpace: 'nowrap',
                          zIndex: 6
                        }}
                      >
                        📍 Harga Anda: Rp {shopP.toLocaleString('id-ID')}
                      </div>
                    </div>

                    {/* 3-Column Price Box Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '40px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', paddingTop: '18px', borderTop: '1px dashed #CBD5E1' }}>
                      <div style={{ background: '#FFF', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '0px', marginBottom: '4px', marginLeft: '0px', marginRight: '0px' }}>Harga Terendah Pasar</div>
                        <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#334155' }}>Rp {minP.toLocaleString('id-ID')}</div>
                      </div>
                      <div style={{ background: '#F0FDF4', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', border: '1.5px solid #BBF7D0', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#15803D', fontWeight: 700, marginTop: '0px', marginBottom: '4px', marginLeft: '0px', marginRight: '0px' }}>🎯 Target Zona Wajar (Sweet-Spot)</div>
                        <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#166534' }}>
                          Rp {wMin.toLocaleString('id-ID')} – Rp {wMax.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div style={{ background: '#FFF', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '0px', marginBottom: '4px', marginLeft: '0px', marginRight: '0px' }}>Harga Tertinggi Pasar</div>
                        <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#334155' }}>Rp {maxP.toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>

            {data.analisis_mendalam && (
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginTop: '0px', marginBottom: '44px', marginLeft: '0px', marginRight: '0px' }}>
                <div style={{ background: 'var(--surface)', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '36px', paddingRight: '36px', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0px', marginBottom: '20px', marginLeft: '0px', marginRight: '0px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                      <span style={{ fontSize: '24px' }}>📈</span> Posisi Harga Pasar
                    </h3>
                    <span style={{ fontSize: '13px', background: data.analisis_mendalam.analisis_harga.is_cheaper ? '#F0FDF4' : '#FFFBEB', color: data.analisis_mendalam.analisis_harga.is_cheaper ? '#15803D' : '#B45309', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '14px', paddingRight: '14px', borderRadius: '8px', fontWeight: 700, border: data.analisis_mendalam.analisis_harga.is_cheaper ? '1px solid #BBF7D0' : '1px solid #FDE68A' }}>
                      {data.analisis_mendalam.analisis_harga.posisi_pasar}
                    </span>
                  </div>
                  <p style={{ fontSize: '14.5px', color: '#1E293B', lineHeight: 1.68, marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px', fontWeight: 450, textAlign: 'justify' }}>
                    {data.analisis_mendalam.analisis_harga.penjelasan_posisi}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '18px', paddingRight: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flex: '1', textAlign: 'left', fontSize: '13.5px', color: '#475569', fontWeight: 600 }}>
                        Vs Rata-rata Pasar (Rp {data.analisis_mendalam.analisis_harga.mean_price.toLocaleString('id-ID')})
                      </div>
                      <div style={{ flex: '1', textAlign: 'right', fontSize: '14.5px', fontWeight: 800, color: data.analisis_mendalam.analisis_harga.is_cheaper ? '#15803D' : '#D97706' }}>
                        {data.analisis_mendalam.analisis_harga.label_selisih}
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '18px', paddingRight: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flex: '1', textAlign: 'left', fontSize: '13.5px', color: '#475569', fontWeight: 600 }}>
                        Vs Harga Terendah (Rp {data.analisis_mendalam.analisis_harga.min_price.toLocaleString('id-ID')})
                      </div>
                      <div style={{ flex: '1', textAlign: 'right', fontSize: '14.5px', fontWeight: 700, color: '#334155' }}>
                        +Rp {data.analisis_mendalam.analisis_harga.diff_from_min.toLocaleString('id-ID')} di atas Terendah
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '18px', paddingRight: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flex: '1', textAlign: 'left', fontSize: '13.5px', color: '#475569', fontWeight: 600 }}>
                        Vs Harga Tertinggi (Rp {data.analisis_mendalam.analisis_harga.max_price.toLocaleString('id-ID')})
                      </div>
                      <div style={{ flex: '1', textAlign: 'right', fontSize: '14.5px', fontWeight: 700, color: '#334155' }}>
                        -Rp {data.analisis_mendalam.analisis_harga.diff_from_max.toLocaleString('id-ID')} di bawah Tertinggi
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '36px', paddingRight: '36px', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0px', marginBottom: '18px', marginLeft: '0px', marginRight: '0px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                      <span style={{ fontSize: '24px' }}>⭐</span> Evaluasi Ulasan Pembeli
                    </h3>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#B45309', background: '#FEF3C7', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '14px', paddingRight: '14px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                      ★ {data.analisis_mendalam.evaluasi_ulasan.rating_rata} ({data.analisis_mendalam.evaluasi_ulasan.sentimen_positif}% Puas)
                    </span>
                  </div>
                  <p style={{ fontSize: '14.5px', color: '#1E293B', lineHeight: 1.68, marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px', fontWeight: 450, textAlign: 'justify' }}>
                    {data.analisis_mendalam.evaluasi_ulasan.ringkasan_ulasan}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
                    <div style={{ background: '#F0FDF4', paddingTop: '22px', paddingBottom: '22px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803D', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✅</span> Hal yang Dipuji Pembeli:
                      </div>
                      <ul style={{ paddingLeft: '20px', fontSize: '14.5px', color: '#166534', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', lineHeight: 1.68 }}>
                        {data.analisis_mendalam.evaluasi_ulasan.hal_dipuji.map((h: string, i: number) => (
                          <li key={i} style={{ marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', textAlign: 'justify' }}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: '#FFFBEB', paddingTop: '22px', paddingBottom: '22px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', border: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#B45309', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>💡</span> Sarana Perbaikan:
                      </div>
                      <ul style={{ paddingLeft: '20px', fontSize: '14.5px', color: '#92400E', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', lineHeight: 1.68 }}>
                        {data.analisis_mendalam.evaluasi_ulasan.hal_diperbaiki.map((h: string, i: number) => (
                          <li key={i} style={{ marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', textAlign: 'justify' }}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {data.analisis_mendalam.analisis_rentang && (
                  <div style={{ background: 'var(--surface)', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '36px', paddingRight: '36px', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '22px', marginLeft: '0px', marginRight: '0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📊</span> Analisis Perbedaan Harga Terendah vs Tertinggi
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px', marginTop: '20px' }}>
                      <div style={{ background: '#F8FAFC', paddingTop: '22px', paddingBottom: '22px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🔍</span> Penyebab Perbedaan Harga Kompetitor:
                        </div>
                        <ul style={{ paddingLeft: '20px', fontSize: '14.5px', color: '#334155', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', lineHeight: 1.68 }}>
                          {data.analisis_mendalam.analisis_rentang.penyebab_perbedaan.map((p: string, idx: number) => (
                            <li key={idx} style={{ marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', textAlign: 'justify' }}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ background: '#F0F9FF', paddingTop: '22px', paddingBottom: '22px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', border: '1px solid #BAE6FD' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0369A1', marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>👥</span> Signifikansi bagi Pembeli:
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284C7', background: '#E0F2FE', paddingTop: '4px', paddingBottom: '4px', paddingLeft: '10px', paddingRight: '10px', borderRadius: '6px', display: 'inline-block', marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px' }}>
                          {data.analisis_mendalam.analisis_rentang.signifikansi_pembeli.tingkat}
                        </div>
                        <p style={{ fontSize: '14.5px', color: '#1E293B', lineHeight: 1.68, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', textAlign: 'justify' }}>
                          {data.analisis_mendalam.analisis_rentang.signifikansi_pembeli.analisis}
                        </p>
                      </div>

                      <div style={{ background: '#FEFCE8', paddingTop: '22px', paddingBottom: '22px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', border: '1px solid #FEF08A' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#A16207', marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📈</span> Korelasi Harga vs Penjualan:
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#854D0E', background: '#FEF9C3', paddingTop: '4px', paddingBottom: '4px', paddingLeft: '10px', paddingRight: '10px', borderRadius: '6px', display: 'inline-block', marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px' }}>
                          {data.analisis_mendalam.analisis_rentang.korelasi_penjualan.kesimpulan}
                        </div>
                        <p style={{ fontSize: '14.5px', color: '#1E293B', lineHeight: 1.68, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', textAlign: 'justify' }}>
                          {data.analisis_mendalam.analisis_rentang.korelasi_penjualan.analisis}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ background: 'var(--surface)', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '36px', paddingRight: '36px', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🎯</span> Rekomendasi Strategis & Action Plan Penjual
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px', marginTop: '18px', marginBottom: '28px' }}>
                    {data.analisis_mendalam.rekomendasi_penjual.strategi_harga.map((opt: any, idx: number) => (
                      <div key={idx} style={{ background: idx === 0 ? '#F0FDF4' : '#F8FAFC', paddingTop: '22px', paddingBottom: '22px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', border: idx === 0 ? '2px solid #22C55E' : '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '6px', marginLeft: '0px', marginRight: '0px' }}>{opt.nama_opsi}</div>
                        <div style={{ fontSize: '19.5px', fontWeight: 800, color: '#15803D', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px' }}>
                          Target Harga: Rp {opt.target_harga.toLocaleString('id-ID')}
                        </div>
                        <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.68, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', textAlign: 'justify' }}>{opt.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#EEF2FF', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '14px', border: '1.5px solid #C7D2FE' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#3730A3', marginTop: '0px', marginBottom: '14px', marginLeft: '0px', marginRight: '0px' }}>📋 Rekomendasi Tindakan Operasional Toko:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {data.analisis_mendalam.rekomendasi_penjual.tindakan_operasional.map((act: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14.5px', color: '#1E1B4B', lineHeight: 1.65, fontWeight: 500 }}>
                          <span style={{ fontSize: '16px' }}>🚀</span>
                          <span style={{ textAlign: 'justify' }}>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {data.kompetitor_lokal && data.kompetitor_lokal.produk.length > 0 && (
              <section className="lokal-section" style={{ marginTop: '0px', marginBottom: '44px', marginLeft: '0px', marginRight: '0px' }}>
                <div className="lokal-banner" style={{ background: '#F8FAFC', paddingTop: '28px', paddingBottom: '28px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '18px', border: '1px solid #E2E8F0', color: '#0F172A', marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <p className="eyebrow" style={{ color: '#2563EB', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '0px', marginBottom: '6px', marginLeft: '0px', marginRight: '0px' }}>
                      📍 Pembanding Wilayah Pengiriman
                    </p>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', color: '#0F172A' }}>
                      {data.kompetitor_lokal.label_wilayah || `Kompetitor Lokal (${data.kompetitor_lokal.kota_asal})`}
                    </h2>
                    <p style={{ fontSize: '14.5px', color: '#475569', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', lineHeight: 1.68, textAlign: 'justify' }}>
                      {data.kompetitor_lokal.insight}
                    </p>
                  </div>
                  <div className="lokal-banner-stat" style={{ background: '#EFF6FF', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', textAlign: 'center', border: '1.5px solid #BFDBFE' }}>
                    <div className="lokal-stat-num" style={{ fontSize: '28px', fontWeight: 800, color: '#1D4ED8' }}>{data.kompetitor_lokal.produk.length}</div>
                    <div className="lokal-stat-label" style={{ fontSize: '12.5px', color: '#1E40AF', fontWeight: 700 }}>
                      {data.kompetitor_lokal.badge_stat_label || `SELLER ${data.kompetitor_lokal.kota_asal}`}
                    </div>
                  </div>
                </div>

                <div className="lokal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
                  {data.kompetitor_lokal.produk.map((p: any, idx: number) => {
                    const truncatedTitle = p.nama.length > 55 ? `${p.nama.slice(0, 52)}...` : p.nama;
                    return (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lokal-card"
                        style={{
                          background: 'var(--surface)',
                          paddingTop: '22px',
                          paddingBottom: '22px',
                          paddingLeft: '24px',
                          paddingRight: '24px',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          textDecoration: 'none',
                          color: 'inherit',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'transform 0.15s ease, border-color 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px' }}>
                            <div style={{ flex: 1 }}>
                              <div
                                title={p.nama}
                                style={{
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  color: '#0F172A',
                                  lineHeight: 1.4,
                                  marginTop: '0px',
                                  marginBottom: '6px',
                                  marginLeft: '0px',
                                  marginRight: '0px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  minHeight: '42px'
                                }}
                              >
                                {truncatedTitle}
                              </div>
                              <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>{p.toko} ({p.city})</div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 800, background: p.is_cheaper ? '#F0FDF4' : '#FFFBEB', color: p.is_cheaper ? '#15803D' : '#B45309', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', paddingRight: '10px', borderRadius: '6px', whiteSpace: 'nowrap', border: p.is_cheaper ? '1px solid #BBF7D0' : '1px solid #FDE68A' }}>
                              {p.badge_selisih}
                            </span>
                          </div>
                          <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '14px', marginLeft: '0px', marginRight: '0px' }}>
                            Rp {(p.harga ?? p.price ?? 0).toLocaleString('id-ID')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px dashed #E2E8F0', marginTop: '12px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#B45309' }}>★ {(p.rating || 4.8).toFixed(1)}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '6px' }}>Buka di Tokopedia ↗</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {data.produk_serupa && data.produk_serupa.length > 0 && (
              <section className="serupa-section" style={{ marginTop: '0px', marginBottom: '56px', marginLeft: '0px', marginRight: '0px' }}>
                <div className="serupa-banner" style={{ background: 'var(--surface)', paddingTop: '28px', paddingBottom: '28px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '18px', border: '1px solid #E2E8F0', color: '#0F172A', marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <p className="eyebrow" style={{ color: '#4F46E5', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '0px', marginBottom: '6px', marginLeft: '0px', marginRight: '0px' }}>
                      🔎 Pembanding Produk Pasar
                    </p>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', color: '#0F172A' }}>
                      Produk Serupa (Kompetitor Sejenis)
                    </h2>
                    <p style={{ fontSize: '14.5px', color: '#475569', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', lineHeight: 1.68, textAlign: 'justify' }}>
                      Pencarian real-time toko kompetitor sejenis di Tokopedia dengan spesifikasi dan satuan transaksi setara.
                    </p>
                  </div>
                  <div style={{ background: '#EEF2FF', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '14px', textAlign: 'center', border: '1.5px solid #C7D2FE' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#4338CA' }}>{data.produk_serupa.length}</div>
                    <div style={{ fontSize: '12.5px', color: '#3730A3', fontWeight: 700 }}>KOMPETITOR REAL-TIME</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
                  {data.produk_serupa.map((p: any, idx: number) => {
                    const truncatedTitle = p.nama.length > 55 ? `${p.nama.slice(0, 52)}...` : p.nama;
                    const itemPrice = p.harga ?? p.price ?? 0;
                    const isCheaperThanShop = itemPrice < data.harga_toko;
                    const diffPct = Math.round(Math.abs((itemPrice - data.harga_toko) / data.harga_toko) * 100);

                    return (
                      <a
                        key={idx}
                        href={p.url || `https://www.tokopedia.com/search?q=${encodeURIComponent(p.nama)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'var(--surface)',
                          paddingTop: '22px',
                          paddingBottom: '22px',
                          paddingLeft: '24px',
                          paddingRight: '24px',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          textDecoration: 'none',
                          color: 'inherit',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'transform 0.15s ease, border-color 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px' }}>
                            <div style={{ flex: 1 }}>
                              <div
                                title={p.nama}
                                style={{
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  color: '#0F172A',
                                  lineHeight: 1.4,
                                  marginTop: '0px',
                                  marginBottom: '6px',
                                  marginLeft: '0px',
                                  marginRight: '0px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  minHeight: '42px'
                                }}
                              >
                                {truncatedTitle}
                              </div>
                              <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>{p.toko} ({p.city})</div>
                            </div>
                            {itemPrice !== data.harga_toko && (
                              <span style={{ fontSize: '12px', fontWeight: 800, background: isCheaperThanShop ? '#F0FDF4' : '#FFFBEB', color: isCheaperThanShop ? '#15803D' : '#B45309', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', paddingRight: '10px', borderRadius: '6px', whiteSpace: 'nowrap', border: isCheaperThanShop ? '1px solid #BBF7D0' : '1px solid #FDE68A' }}>
                                {isCheaperThanShop ? `Lebih Hemat ${diffPct}%` : `+${diffPct}%`}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '14px', marginLeft: '0px', marginRight: '0px' }}>
                            Rp {itemPrice.toLocaleString('id-ID')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px dashed #E2E8F0', marginTop: '12px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#B45309' }}>★ {(p.rating || 4.8).toFixed(1)}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '6px' }}>Buka di Tokopedia ↗</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
