import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  Layers,
  Star,
} from 'lucide-react';
import { AikobiPrecedentShowcase } from '../components/aikobi-precedent-showcase';

export default function HomePage() {

  return (
    <div className="pt-2 sm:pt-0 relative">
      {/* ============================================================
          SECTION 1: HERO SECTION (PRECEDENT: PEDESTAL & KOBI MASCOT)
          ============================================================ */}
      <section className="relative z-10 text-center max-w-6xl mx-auto pt-6 sm:pt-9 lg:pt-10">
        {/* Fine Dotted Architectural Grid (fades cleanly to transparent before edges) */}
        <div
          aria-hidden="true"
          className="aikobi-hero-grid pointer-events-none absolute inset-x-0 max-w-5xl mx-auto -top-2 h-[560px] -z-20"
        />

        {/* Smooth Seamless Dual-Side Ambient Glow (full-viewport width, ellipses contained 100% inside box) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-16 -translate-x-1/2 -z-10 w-screen max-w-none h-[640px] opacity-85 dark:opacity-65"
          style={{
            background:
              'radial-gradient(ellipse 24% 34% at 24% 42%, rgba(37, 99, 235, 0.14) 0%, transparent 66%), radial-gradient(ellipse 24% 34% at 76% 44%, rgba(16, 185, 129, 0.12) 0%, transparent 66%), radial-gradient(ellipse 34% 36% at 50% 50%, rgba(59, 130, 246, 0.12) 0%, transparent 66%)',
          }}
        />

        {/* Orbital Geometric Rings & Corner Glass Vignettes (Left Side) */}
        <div aria-hidden="true" className="hidden md:block pointer-events-none absolute left-0 xl:left-2 inset-y-0 w-52 -z-10">
          {/* Upper-Left Dashed Orbital Ring */}
          <svg
            viewBox="0 0 180 180"
            className="aikobi-hero-spin absolute -left-8 -top-6 w-44 h-44 text-blue-500/20 dark:text-blue-400/20"
          >
            <circle cx="90" cy="90" r="76" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
            <circle cx="90" cy="90" r="52" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" />
            <circle cx="90" cy="14" r="3" fill="#3b82f6" fillOpacity="0.65" />
          </svg>

          {/* Left Floating UMKM Trend Card (positioned in lower-left corner) */}
          <div className="aikobi-hero-float-left absolute left-1 bottom-12 sm:bottom-14 md:bottom-16 w-44 p-3 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-700/70 dark:bg-slate-900/75 backdrop-blur-md shadow-lg text-left space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <span>Harga Paling Pas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="text-sm font-extrabold text-slate-900 dark:text-white tabular-num">Rp 124rb</div>
              <svg viewBox="0 0 64 24" className="w-14 h-6 overflow-visible">
                <path
                  d="M2 20 C16 18, 26 11, 38 12 C48 13, 54 4, 62 3"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="62" cy="3" r="3" fill="#059669" />
              </svg>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Peminat naik +24%</div>
          </div>

          {/* Upper-Left Floating Bokeh Dots */}
          <span
            className="aikobi-mote absolute left-10 top-20 w-2 h-2 rounded-full bg-blue-500/45 dark:bg-blue-300/60"
            style={{ '--mote-dur': '4.0s', '--mote-delay': '-0.4s' } as React.CSSProperties}
          />
          <span
            className="aikobi-mote absolute left-24 top-32 w-1.5 h-1.5 rounded-full bg-emerald-500/50 dark:bg-emerald-300/60"
            style={{ '--mote-dur': '3.6s', '--mote-delay': '-1.8s' } as React.CSSProperties}
          />
        </div>

        {/* Orbital Geometric Rings & Corner Glass Vignettes (Right Side) */}
        <div aria-hidden="true" className="hidden md:block pointer-events-none absolute right-0 xl:right-2 inset-y-0 w-52 -z-10">
          {/* Upper-Right Counter-Rotating Orbital Ring */}
          <svg
            viewBox="0 0 180 180"
            className="aikobi-hero-spin-rev absolute -right-8 top-0 w-44 h-44 text-indigo-500/20 dark:text-blue-400/20"
          >
            <circle cx="90" cy="90" r="72" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 7" />
            <circle cx="90" cy="90" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 10" />
            <circle cx="18" cy="90" r="3" fill="#10b981" fillOpacity="0.7" />
          </svg>

          {/* Right Floating Local Buyer Proof Card (positioned in lower-right corner) */}
          <div className="aikobi-hero-float-right absolute right-1 bottom-12 sm:bottom-14 md:bottom-16 w-44 p-3 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-700/70 dark:bg-slate-900/75 backdrop-blur-md shadow-lg text-left space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-300">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                4.9 Puas
              </span>
              <span className="text-[9px] font-mono text-blue-600 dark:text-blue-300 uppercase">Sekota</span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
              Ongkir Lebih Hemat
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">20 toko pesaing dicek</div>
          </div>

          {/* Upper-Right Floating Bokeh Dots */}
          <span
            className="aikobi-mote absolute right-12 top-24 w-2 h-2 rounded-full bg-indigo-500/45 dark:bg-blue-300/60"
            style={{ '--mote-dur': '4.3s', '--mote-delay': '-1.1s' } as React.CSSProperties}
          />
          <span
            className="aikobi-mote absolute right-24 top-36 w-1.5 h-1.5 rounded-full bg-blue-500/45 dark:bg-white/55"
            style={{ '--mote-dur': '3.8s', '--mote-delay': '-2.2s' } as React.CSSProperties}
          />
        </div>

        {/* Smooth Seamless Brand Backlight (Centered, fades smoothly to 100% transparent, zero boundary seams) */}
        <div
          aria-hidden="true"
          className="aikobi-aura-pulse pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 -z-10 w-[400px] sm:w-[680px] lg:w-[860px] h-[300px] sm:h-[440px] rounded-full blur-3xl opacity-60 dark:opacity-35"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(37, 99, 235, 0.16) 0%, rgba(6, 182, 212, 0.11) 28%, rgba(16, 185, 129, 0.07) 44%, transparent 64%)',
          }}
        />

        {/* Precedent Editorial Typography: Sans-serif + Italic Serif */}
        <div className="space-y-0.5 sm:space-y-1 max-w-3xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            AIKOBI, Sahabat Usaha
          </h1>
          <p className="font-editorial text-3xl sm:text-4xl lg:text-[3.25rem] text-blue-600 dark:text-blue-400 tracking-normal leading-[1.16]">
            Untuk Untung Toko Anda
          </p>
        </div>

        {/* Center Stage: Mascot Standing Seamlessly on 3D Pedestal Cap with Floating Action Buttons */}
        <div className="relative mt-1 sm:mt-1.5 pt-0 flex flex-col items-center justify-center">
          {/* Mascot Figure with Wings Open & Floating Buttons on Each Wing (Lowered onto disc) */}
          <div className="relative z-20 w-80 sm:w-[470px] md:w-[550px] lg:w-[590px] flex items-end justify-center translate-y-2 sm:translate-y-3">
            {/* Floating Action Button: Over Left Wing (Mulai Konsultasi Bisnis) */}
            <Link
              href="/konsultasi"
              className="absolute -left-2 sm:-left-12 md:-left-14 lg:-left-16 top-28 sm:top-28 md:top-32 lg:top-36 z-30 group inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 py-2 sm:py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] sm:text-sm shadow-xl shadow-blue-500/40 border border-blue-400/40 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 animate-float-slow whitespace-nowrap"
            >
              <span className="inline-flex items-center gap-1.5 sm:gap-2.5 text-white">
                <span>Mulai Konsultasi Bisnis</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            {/* Mascot Open Wings Illustration from Assets/Mascot_openwing.jpg */}
            <Image
              src="/brand/mascot/mascot-openwing.png"
              alt="KOBI Maskot Konsultan Bisnis Sayap Terbuka"
              width={560}
              height={463}
              priority
              className="w-full h-auto max-h-[260px] sm:max-h-[350px] md:max-h-[395px] lg:max-h-[420px] object-contain select-none pointer-events-none"
            />

            {/* Floating Action Button: Over Right Wing (Tanya KOBI) */}
            <Link
              href="/tanya"
              className="absolute -right-2 sm:-right-10 md:-right-12 lg:-right-14 top-28 sm:top-28 md:top-32 lg:top-36 z-30 group inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 py-2 sm:py-3 rounded-full precedent-pill hover:bg-white/95 dark:hover:bg-slate-900/95 text-slate-800 dark:text-slate-100 font-semibold text-[11px] sm:text-sm shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/90 dark:border-slate-700/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 animate-float-reverse whitespace-nowrap"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500/15 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:rotate-12">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span>Tanya KOBI</span>
            </Link>
          </div>

          {/* 3D Fluted Circular Pedestal Disc Cap (z-10, sits cleanly beneath the claws) */}
          <div className="relative -mt-4 sm:-mt-5 z-10 w-72 sm:w-[410px] md:w-[470px] lg:w-[495px] h-11 sm:h-13 rounded-[100%] pedestal-cap flex items-center justify-center shadow-xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="w-[85%] h-[60%] rounded-[100%] bg-gradient-to-b from-white/90 to-slate-100/40 dark:from-slate-700/30 dark:to-slate-800/20 blur-[1px]" />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: FLUTED ARCHITECTURAL PEDESTAL SPINE (UNBROKEN CONTINUOUS)
          ============================================================ */}
      <section className="relative z-0 max-w-5xl mx-auto px-4 pt-1 sm:pt-1 pb-12 sm:pb-16">
        {/* Central Vertical Fluted Spine Column (Tucked cleanly under the Disc Cap, never poking out) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-4 sm:-top-5 bottom-0 -translate-x-1/2 w-56 sm:w-80 md:w-96 fluted-pedestal rounded-t-3xl rounded-b-3xl border-x border-slate-300/80 dark:border-slate-700 opacity-90 dark:opacity-85 -z-10 shadow-lg"
        />

        {/* ============================================================
            3D CYLINDRICAL ROTATING RING TEXT
            8 Distinct Pillars of Advisory: Akurat, Objektif, Analitis, Rasional, Terukur, Adaptif, Efisien, Strategis
            Each segment contains strictly 1 word, orbiting around the pillar with zero collisions.
            ============================================================ */}
        <div className="relative text-center max-w-4xl mx-auto pt-0 sm:pt-1 mb-28 sm:mb-36 lg:mb-40">
          <h2 className="sr-only">
            Akurat, Objektif, Analitis, Rasional, Terukur, Adaptif, Efisien, Strategis
          </h2>
          <div className="relative h-14 sm:h-16 md:h-20 flex items-center justify-center [perspective:1000px] select-none pointer-events-auto">
            <div
              className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d] animate-cylinder-spin hover:[animation-play-state:paused] [--cylinder-radius:135px] xs:[--cylinder-radius:170px] sm:[--cylinder-radius:220px] md:[--cylinder-radius:260px] lg:[--cylinder-radius:285px]"
            >
              {[
                { text: 'AKURAT', color: 'text-blue-600 dark:text-blue-400' },
                { text: 'OBJEKTIF', color: 'text-slate-900 dark:text-white' },
                { text: 'ANALITIS', color: 'text-blue-600 dark:text-blue-400' },
                { text: 'RASIONAL', color: 'text-slate-900 dark:text-white' },
                { text: 'TERUKUR', color: 'text-emerald-600 dark:text-emerald-400' },
                { text: 'ADAPTIF', color: 'text-slate-900 dark:text-white' },
                { text: 'EFISIEN', color: 'text-cyan-600 dark:text-cyan-400' },
                { text: 'STRATEGIS', color: 'text-slate-900 dark:text-white' },
              ].map((item, idx) => {
                const angle = idx * 45; // Exactly 8 words: 360 / 8 = 45 deg per segment
                return (
                  <div
                    key={item.text}
                    className="absolute flex items-center justify-center [transform-style:preserve-3d]"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(var(--cylinder-radius))`,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Front Face: Exactly 1 word per segment, crisp, uppercase, ample spacing */}
                    <span
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                      className={`text-xs xs:text-sm sm:text-base md:text-lg font-black uppercase tracking-widest whitespace-nowrap select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.10)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] ${item.color}`}
                    >
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4 Staggered Milestone Feature Cards (Matches Precedent 001 - 004) */}
        <div className="space-y-12 sm:space-y-20 relative">
          {/* Card 001 (Left Side) */}
          <div className="flex flex-col sm:flex-row items-center justify-start">
            <div className="w-full sm:w-[46%] p-5 sm:p-6 rounded-3xl precedent-pill space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">001</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Ambil Data Etalase &amp; Varian
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Membaca data publik Tokopedia secara langsung: harga etalase, variasi ukuran (S/M/L), serta memisahkan jualan eceran dan grosir tanpa perlu masuk akun toko.
                </p>
              </div>
            </div>
          </div>

          {/* Card 002 (Right Side) */}
          <div className="flex flex-col sm:flex-row items-center justify-end">
            <div className="w-full sm:w-[46%] p-5 sm:p-6 rounded-3xl precedent-pill space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">002</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Peta Harga Paling Pas
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Hitungan pintar otomatis yang menunjukkan batas harga wajar pasar agar toko Anda tidak terjebak banting harga rugi atau mematok harga kemahalan.
                </p>
              </div>
            </div>
          </div>

          {/* Card 003 (Left Side) */}
          <div className="flex flex-col sm:flex-row items-center justify-start">
            <div className="w-full sm:w-[46%] p-5 sm:p-6 rounded-3xl precedent-pill space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">003</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Unggul Ongkir Sesama Wilayah
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Daftar perbandingan pesaing terdekat di kota pengiriman yang sama agar pembeli memilih toko Anda karena ongkir lebih hemat dan paket lebih cepat sampai.
                </p>
              </div>
            </div>
          </div>

          {/* Card 004 (Right Side) */}
          <div className="flex flex-col sm:flex-row items-center justify-end">
            <div className="w-full sm:w-[46%] p-5 sm:p-6 rounded-3xl precedent-pill space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">004</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Rangkuman Ulasan &amp; Langkah Praktis
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Merangkum hal yang disukai dan dikeluhkan pembeli secara otomatis, alasan harga pesaing berbeda, serta rencana kerja 30 hari yang siap langsung dipakai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: PRECEDENT LANDING SHOWCASE
          ============================================================ */}
      <AikobiPrecedentShowcase />
    </div>
  );
}
