import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang AIMA — AI Market Analyzer',
  description: 'Informasi tim & misi di balik pengembangan AIMA (AI Market Analyzer).',
};

export default function TentangPage() {
  const topTeam = [
    { name: 'Tio', role: 'Frontend Developer', initial: 'T' },
    { name: 'Zhafran', role: 'Project Manager', initial: 'Z' },
    { name: 'Ferry', role: 'AI Developer', initial: 'F' },
  ];

  const bottomTeam = [
    { name: 'Azka', role: 'Scraping Engineer', initial: 'A' },
    { name: 'Joshua', role: 'Backend Developer', initial: 'J' },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
          <Link href="/ai">Analisis AI</Link>
          <Link href="/tentang" className="active">Tentang</Link>
        </nav>
      </header>

      <div style={{ flex: 1, paddingTop: '40px', paddingBottom: '60px' }}>
        {/* Header Hero Section */}
        <section style={{ textAlign: 'center', marginTop: '0px', marginBottom: '36px', marginLeft: 'auto', marginRight: 'auto', maxWidth: '720px', paddingLeft: '20px', paddingRight: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px', letterSpacing: '-0.5px' }}>
            Tentang AIMA (AI Market Analyzer)
          </h1>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.65, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', fontWeight: 450 }}>
            Kami menciptakan AIMA untuk membebaskan pelaku UMKM & penjual e-commerce Tokopedia dari tebak-menebak harga jual. Cukup satu tempat untuk menganalisis lanskap persaingan etalase, kompetitor lokal, ulasan pembeli, dan mendapatkan strategi penetapan harga berbasis AI.
          </p>
        </section>

        {/* Main Card Content Container */}
        <main style={{ maxWidth: '900px', marginTop: '0px', marginBottom: '0px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px' }}>
          {/* Card 1: Misi Kami */}
          <div style={{ background: '#FFFFFF', paddingTop: '28px', paddingBottom: '28px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '12px', marginLeft: '0px', marginRight: '0px' }}>
              Misi kami
            </h2>
            <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.68, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', textAlign: 'justify', fontWeight: 450 }}>
              Banyak pelaku usaha e-commerce menentukan harga hanya berdasarkan insting atau mengikuti kompetitor tanpa data mendalam — akibatnya margin tergerus atau produk kalah saing. AIMA hadir menutup celah tersebut dengan mengubah data harga, rating, ulasan pembeli, dan lokasi seller menjadi rekomendasi penetapan harga yang presisi, mudah dipahami, dan langsung siap diterapkan.
            </p>
          </div>

          {/* Card Row 2: 3-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '0px', marginBottom: '24px', marginLeft: '0px', marginRight: '0px' }}>
            {/* Card: Real-time Live Scraping */}
            <div style={{ background: '#FFFFFF', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#22C55E' }} />
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0px', marginBottom: '16px', marginLeft: '0px', marginRight: '0px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '8px', marginLeft: '0px', marginRight: '0px' }}>
                Real-time Live Scraping
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                Rekomendasi ditarik langsung dari data persaingan etalase, varian produk, rating, dan ulasan pembeli Tokopedia secara real-time.
              </p>
            </div>

            {/* Card: Analisis Wilayah & Lokal */}
            <div style={{ background: '#FFFFFF', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#6366F1' }} />
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0px', marginBottom: '16px', marginLeft: '0px', marginRight: '0px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '8px', marginLeft: '0px', marginRight: '0px' }}>
                Analisis Wilayah & Lokal
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                AIMA membandingkan produk Anda dengan kompetitor lokal sesama wilayah pengiriman (fcity) untuk mengoptimalkan ongkir.
              </p>
            </div>

            {/* Card: Rekomendasi AI Konsultan */}
            <div style={{ background: '#FFFFFF', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#F59E0B' }} />
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0px', marginBottom: '16px', marginLeft: '0px', marginRight: '0px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '8px', marginLeft: '0px', marginRight: '0px' }}>
                Rekomendasi AI Konsultan
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                Menyajikan zona harga wajar (Sweet-Spot), sintetis ulasan pembeli, penyebab selisih harga, dan action plan toko.
              </p>
            </div>
          </div>

          {/* Card 3: Tim di balik AIMA */}
          <div style={{ background: '#FFFFFF', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginTop: '0px', marginBottom: '32px', marginLeft: '0px', marginRight: '0px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '28px', marginLeft: '0px', marginRight: '0px', textAlign: 'center' }}>
              Tim di balik AIMA
            </h2>

            {/* Top Row: 3 Members */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginTop: '0px', marginBottom: '32px', marginLeft: '0px', marginRight: '0px' }}>
              {topTeam.map((member, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', border: '1.5px solid #CBD5E1', marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {member.initial}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '3px', marginLeft: '0px', marginRight: '0px' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                    {member.role}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row: 2 Members (Centered) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '64px', marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px', flexWrap: 'wrap' }}>
              {bottomTeam.map((member, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', border: '1.5px solid #CBD5E1', marginTop: '0px', marginBottom: '10px', marginLeft: '0px', marginRight: '0px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {member.initial}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '0px', marginBottom: '3px', marginLeft: '0px', marginRight: '0px' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginTop: '0px', marginBottom: '0px', marginLeft: '0px', marginRight: '0px' }}>
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="site-footer" style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', paddingTop: '20px', paddingBottom: '28px' }}>
        © 2026 AIMA (AI Market Analyzer) — Platform Riset & Strategi Harga Tokopedia Terdepan.
      </footer>
    </div>
  );
}
