'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  Truck,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Search,
  Compass,
} from 'lucide-react';

export default function TokensTestPage() {
  const [testInput, setTestInput] = useState('https://www.tokopedia.com/store/kemeja-batik-premium');

  return (
    <div className="space-y-12 py-2">
      {/* Hero Banner */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Fase 1: Sistem Token Desain & Liquid Glassmorphism
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AIKOBI Design Tokens & Physics
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-base leading-relaxed">
          Verifikasi implementasi Tailwind CSS v4, variabel semantik (Light/Dark), kelengkungan squircle,
          fondasi Modern Flat (80%) dan aksen Liquid Glassmorphism (20%) yang siap digunakan di seluruh aplikasi.
        </p>
      </section>

      {/* 1. PALET WARNA SEMANTIK BISNIS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            1. Palet Warna Semantik & Indikator Bisnis
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Royal Indigo */}
          <div className="flat-surface p-4 space-y-2 border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Brand Core
              </span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Royal Indigo</div>
            <div className="tabular-num text-xs text-slate-500 dark:text-slate-400">#2563EB</div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Identitas utama AIKOBI: cerdas, profesional, dan dapat dipercaya.
            </p>
          </div>

          {/* Sweet-Spot */}
          <div className="flat-surface p-4 space-y-2 border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Harga Pas
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Zona Profit Wajar</div>
            <div className="tabular-num text-xs text-slate-500 dark:text-slate-400">#059669</div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Harga berada di titik ideal permintaan pasar dengan serapan maksimal.
            </p>
          </div>

          {/* Underpriced */}
          <div className="flat-surface p-4 space-y-2 border-t-4 border-t-amber-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Underpriced
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Peringatan Margin</div>
            <div className="tabular-num text-xs text-slate-500 dark:text-slate-400">#D97706</div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Harga terlalu murah, peluang meningkatkan margin tanpa kehilangan pembeli.
            </p>
          </div>

          {/* Overpriced */}
          <div className="flat-surface p-4 space-y-2 border-t-4 border-t-rose-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Kemahalan
              </span>
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Risiko Mandek</div>
            <div className="tabular-num text-xs text-slate-500 dark:text-slate-400">#E11D48</div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Harga di atas batas konsensus pasar, butuh strategi bundling atau diferensiasi.
            </p>
          </div>

          {/* Local Courier Advantage */}
          <div className="flat-surface p-4 space-y-2 border-t-4 border-t-orange-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Local Advantage
              </span>
              <Truck className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Ongkir Lokal</div>
            <div className="tabular-num text-xs text-slate-500 dark:text-slate-400">#EA580C</div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Keunggulan efisiensi pengiriman melawan seller luar pulau/kota.
            </p>
          </div>
        </div>
      </section>

      {/* 2. TIGA TINGKATAN LIQUID GLASSMORPHISM */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          2. Spesifikasi Liquid Glassmorphism (Level 1, 2, 3)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level 1: Floating Nav Pill */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Level 1: Nav & Floating Pill (.liquid-glass-nav)
            </span>
            <div className="liquid-glass-nav p-5 text-center space-y-2">
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Floating Dynamic Island
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Blur terukur (12px), border pembiasan tepi semi-transparan, dan bayangan lembut.
              </p>
            </div>
          </div>

          {/* Level 2: Hero Capsule */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Level 2: Hero Input Capsule (.liquid-glass-hero)
            </span>
            <div className="liquid-glass-hero p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  placeholder="Ketik URL..."
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Dilengkapi <span className="font-semibold text-blue-600 dark:text-blue-400">inner specular glow</span> dan dynamic focus ring.
              </div>
            </div>
          </div>

          {/* Level 3: Sweet-Spot Modal */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Level 3: Advisory Modal (.liquid-glass-modal)
            </span>
            <div className="liquid-glass-modal p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Rekomendasi Terbuka
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Perkiraan Batas Harga Paling Pas
              </div>
              <div className="tabular-num text-xs text-slate-600 dark:text-slate-300">
                Blur 14px + elevasi z-depth untuk dialog konfirmasi.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MODERN FLAT FOUNDATION (80% DATA LAYER) & TABULAR METRICS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          3. Modern Flat Foundation & Angka Finansial Tabular
        </h2>

        <div className="flat-surface p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Kemeja Batik Tulis Pria Lengan Panjang
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kota Solo • Toko Official Store • Rating 4.9 (1.240 ulasan)
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Harga Toko Masuk Zona Harga Pas
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Harga Toko Anda</div>
              <div className="tabular-num text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Rp 145.000
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Harga Tengah Pasar</div>
              <div className="tabular-num text-2xl font-bold text-slate-600 dark:text-slate-300 mt-1">
                Rp 138.500
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Batas Bawah Wajar</div>
              <div className="tabular-num text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Rp 120.000
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Batas Atas Wajar</div>
              <div className="tabular-num text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Rp 165.000
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SQUIRCLE PROGRESSION */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          4. Progresi Kelengkungan Organik (Squircle Radii)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div className="flat-surface p-4 squircle-sm border border-blue-500/30">
            <span className="text-xs font-mono font-bold">sm (8px)</span>
            <p className="text-[11px] text-slate-500 mt-1">Badge & tags</p>
          </div>

          <div className="flat-surface p-4 squircle-md border border-blue-500/30">
            <span className="text-xs font-mono font-bold">md (14px)</span>
            <p className="text-[11px] text-slate-500 mt-1">Cards & inputs</p>
          </div>

          <div className="flat-surface p-4 squircle-lg border border-blue-500/30">
            <span className="text-xs font-mono font-bold">lg (20px)</span>
            <p className="text-[11px] text-slate-500 mt-1">Main panels</p>
          </div>

          <div className="flat-surface p-4 squircle-xl border border-blue-500/30">
            <span className="text-xs font-mono font-bold">xl (28px)</span>
            <p className="text-[11px] text-slate-500 mt-1">Hero capsules</p>
          </div>

          <div className="flat-surface p-4 squircle-pill border border-blue-500/30 col-span-2 sm:col-span-1">
            <span className="text-xs font-mono font-bold">pill (9999px)</span>
            <p className="text-[11px] text-slate-500 mt-1">Floating islands</p>
          </div>
        </div>
      </section>

      {/* 5. KONFIGURASI LOGO RESMI (BRAND GUIDELINES) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            5. Konfigurasi Resmi Logo & Aset Merek (Brand Guidelines)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Konfigurasi 1: Primary Horizontal Lockup */}
          <div className="flat-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                1. Primary Horizontal Lockup
              </span>
              <span className="text-[11px] text-slate-500">Min. 120px</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center min-h-[90px]">
              <Image
                src="/brand/master-logo.png"
                alt="AIKOBI Master Logo"
                width={200}
                height={65}
                className="h-12 w-auto object-contain dark:hidden"
              />
              <Image
                src="/brand/master-logo-dark.png"
                alt="AIKOBI Master Logo Dark"
                width={200}
                height={65}
                className="h-12 w-auto object-contain hidden dark:block"
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Kombinasi simbol dan teks untuk dokumen resmi, dek presentasi, faktur, dan hero header utama.
            </p>
          </div>

          {/* Konfigurasi 2: Horizontal Compact */}
          <div className="flat-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                2. Horizontal Compact (Navbar)
              </span>
              <span className="text-[11px] text-slate-500">36 px – 40 px</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center min-h-[90px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-xs">
                  <Image
                    src="/brand/logo-mark.png"
                    alt="AIKOBI Icon"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain dark:hidden"
                  />
                  <Image
                    src="/brand/logo-mark-dark.png"
                    alt="AIKOBI Icon Dark"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain hidden dark:block"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    AIKOBI
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                    Konsultan Bisnis
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dioptimalkan khusus untuk Dynamic Topbar / Floating Navbar dengan rasio proporsi presisi dan area aman 1X.
            </p>
          </div>

          {/* Konfigurasi 3: Standalone Mark / App Icon */}
          <div className="flat-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                3. Standalone Mark (Favicon)
              </span>
              <span className="text-[11px] text-slate-500">16px / 32px / 48px</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-4 min-h-[90px]">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center shadow-xs">
                <Image
                  src="/brand/logo-mark.png"
                  alt="AIKOBI 48px"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain dark:hidden"
                />
                <Image
                  src="/brand/logo-mark-dark.png"
                  alt="AIKOBI 48px Dark"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain hidden dark:block"
                />
              </div>
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-xs">
                <Image
                  src="/brand/logo-mark.png"
                  alt="AIKOBI 32px"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain dark:hidden"
                />
                <Image
                  src="/brand/logo-mark-dark.png"
                  alt="AIKOBI 32px Dark"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain hidden dark:block"
                />
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Simbol huruf &quot;A&quot; tunggal tanpa teks untuk favicon web, avatar media sosial, dan ikon aplikasi seluler.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
