'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {

  return (
    <div className="py-4 sm:py-8 overflow-hidden relative">
      {/* ============================================================
          SECTION 1: HERO SECTION (PRECEDENT: PEDESTAL & KOBI MASCOT)
          ============================================================ */}
      <section className="relative text-center max-w-6xl mx-auto pt-6 sm:pt-10">
        {/* Smooth Seamless Iridescent Arc on Left (Fades smoothly to 100% transparent, no harsh lines) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 sm:-left-4 top-8 sm:top-14 -z-10 w-[380px] sm:w-[580px] lg:w-[680px] h-[380px] sm:h-[580px] lg:h-[680px] rounded-full blur-3xl opacity-65 dark:opacity-40"
          style={{
            background:
              'radial-gradient(circle at 40% 45%, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.16) 28%, rgba(168, 85, 247, 0.10) 48%, rgba(244, 114, 182, 0.05) 62%, transparent 75%)',
          }}
        />

        {/* Soft Ambient Light Glow Behind Mascot */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 -z-10 w-[360px] sm:w-[680px] h-[360px] sm:h-[680px] rounded-full blur-3xl opacity-75 dark:opacity-45"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.18) 0%, rgba(99, 102, 241, 0.10) 40%, transparent 70%)',
          }}
        />

        {/* Precedent Editorial Typography: Sans-serif + Italic Serif */}
        <div className="space-y-1 sm:space-y-2 max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Kuasai Strategi & Margin
          </h1>
          <p className="font-editorial text-3xl sm:text-5xl lg:text-6xl text-blue-600 dark:text-blue-400 tracking-normal leading-[1.2]">
            Etalase Marketplace Anda
          </p>
        </div>

        {/* Center Stage: Mascot Standing on 3D Pedestal Cap with Floating Action Buttons Over Wings */}
        <div className="relative mt-2 sm:mt-4 pt-2 sm:pt-4 flex flex-col items-center justify-center">
          {/* Mascot Figure with Wings Open & Floating Buttons on Each Wing */}
          <div className="relative z-10 w-80 sm:w-[440px] md:w-[500px] flex items-end justify-center">
            {/* Floating Action Button: Over Left Wing (Mulai Konsultasi Bisnis) */}
            <Link
              href="/konsultasi"
              className="absolute -left-4 sm:-left-16 md:-left-24 lg:-left-28 top-16 sm:top-20 md:top-24 z-30 group inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-blue-500/40 border border-blue-400/40 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 animate-float-slow whitespace-nowrap"
            >
              <span>Mulai Konsultasi Bisnis</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Mascot Open Wings Illustration from Assets/Mascot_openwing.jpg */}
            <Image
              src="/brand/mascot/mascot-openwing.png"
              alt="KOBI Maskot Konsultan Bisnis Sayap Terbuka"
              width={560}
              height={463}
              priority
              className="w-full h-auto max-h-[280px] sm:max-h-[360px] md:max-h-[420px] object-contain filter drop-shadow-[0_20px_35px_rgba(15,23,42,0.18)] dark:drop-shadow-[0_25px_40px_rgba(0,0,0,0.65)] select-none pointer-events-none"
            />

            {/* Floating Action Button: Over Right Wing (Tanya KOBI) */}
            <Link
              href="/tanya"
              className="absolute -right-4 sm:-right-12 md:-right-16 lg:-right-20 top-16 sm:top-20 md:top-24 z-30 group inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full precedent-pill hover:bg-white/95 dark:hover:bg-slate-900/95 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/90 dark:border-slate-700/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 animate-float-reverse whitespace-nowrap"
            >
              <div className="w-5 h-5 rounded-full bg-blue-500/15 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:rotate-12">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Tanya KOBI</span>
            </Link>
          </div>

          {/* 3D Fluted Circular Pedestal Disc Cap */}
          <div className="relative -mt-5 sm:-mt-7 z-20 w-72 sm:w-96 md:w-[460px] h-14 sm:h-16 rounded-[100%] pedestal-cap flex items-center justify-center shadow-lg">
            <div className="w-56 sm:w-72 md:w-80 h-8 sm:h-10 rounded-[100%] bg-slate-200/50 dark:bg-slate-700/40 blur-xs" />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: FLUTED ARCHITECTURAL PEDESTAL SPINE (UNBROKEN CONTINUOUS)
          ============================================================ */}
      <section className="relative max-w-5xl mx-auto px-4 pt-8 sm:pt-12 pb-12 sm:pb-20">
        {/* Central Vertical Fluted Spine Column (Flows continuously without interruption from under the Disc Cap) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-12 sm:-top-16 bottom-0 -translate-x-1/2 w-64 sm:w-80 md:w-96 fluted-pedestal rounded-b-3xl border-x border-slate-300/80 dark:border-slate-700 opacity-90 dark:opacity-85 -z-10 shadow-lg"
        />

        {/* Section Heading Centered Across the Fluted Column */}
        <div className="relative text-center max-w-xl mx-auto mb-16 sm:mb-24 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700 mb-2 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Arsitektur Solusi Terpadu
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Solusi konsultasi cerdas yang
          </h2>
          <p className="font-editorial text-2xl sm:text-4xl text-blue-600 dark:text-blue-400 leading-tight">
            membedah tuntas
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            kebutuhan etalase Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-2 max-w-md mx-auto">
            Dari ekstraksi data kompetitor hingga strategi penetapan harga dan mitigasi komplain ulasan pembeli.
          </p>
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
                  Live Scraping & Multi-Varian
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ekstraksi data publik Tokopedia secara real-time: harga etalase, varian multi-ukuran (S/M/L), serta pemisahan satuan transaksi eceran vs grosir tanpa login.
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
                  Visualizer Rentang Sweet-Spot
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Model inferensi kuantil gradient-boosted yang memetakan batas harga wajar pasar agar Anda tidak terjebak perang harga rugi atau terlampau mahal.
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
                  Keunggulan Ongkir Geolocation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Matriks perbandingan kompetitor lokal sesama wilayah pengiriman untuk memenangkan pembeli regional dengan ongkir lebih hemat dan pengiriman lebih cepat.
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
                  Sintesis Ulasan & Action Plan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dekonstruksi otomatis sentimen kepuasan pembeli, audit penyebab selisih harga kompetitor, dan daftar rekomendasi 30 hari yang siap dieksekusi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: MASCOT PERSONA & CONSULTANT ROLES (4 POSES)
          ============================================================ */}
      <section className="mt-24 sm:mt-32 max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Persona Asisten Konsultan
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            KOBI Hadir di Setiap Langkah Bisnis Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Dari input tautan awal hingga implementasi strategi harga terbaik di etalase toko online.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Persona 1: Greeting */}
          <div className="flat-surface p-5 space-y-4 hover:shadow-lg transition-all text-center flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold">
                01 / Onboarding
              </span>
              <div className="w-36 h-36 mx-auto relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/brand/mascot/mascot-greeting.png"
                  alt="KOBI Menyapa"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">KOBI Menyapa</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Menyambut pedagang, memvalidasi URL Tokopedia, dan menginisiasi live scraping pipeline.
              </p>
            </div>
            <Link
              href="/konsultasi"
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-2 hover:underline"
            >
              <span>Mulai Deteksi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 2: Thinking */}
          <div className="flat-surface p-5 space-y-4 hover:shadow-lg transition-all text-center flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-mono text-[11px] font-bold">
                02 / Analisis
              </span>
              <div className="w-36 h-36 mx-auto relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/brand/mascot/mascot-thinking.png"
                  alt="KOBI Menganalisis"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">KOBI Menganalisis</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Membedah disparitas harga 20 kompetitor aktif, rating bintang, dan topik ulasan kepuasan.
              </p>
            </div>
            <Link
              href="/tanya"
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 pt-2 hover:underline"
            >
              <span>Tanya KOBI</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 3: Pointing */}
          <div className="flat-surface p-5 space-y-4 hover:shadow-lg transition-all text-center flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">
                03 / Rekomendasi
              </span>
              <div className="w-36 h-36 mx-auto relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/brand/mascot/mascot-pointing.png"
                  alt="KOBI Menunjukkan Arah"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">KOBI Menunjukkan Arah</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Menemukan titik sweet-spot wajar dan mengarahkan strategi bundling penaik average order value.
              </p>
            </div>
            <Link
              href="/konsultasi"
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 pt-2 hover:underline"
            >
              <span>Lihat Spektrum</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 4: Approve */}
          <div className="flat-surface p-5 space-y-4 hover:shadow-lg transition-all text-center flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                04 / Validasi
              </span>
              <div className="w-36 h-36 mx-auto relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/brand/mascot/mascot-approve.png"
                  alt="KOBI Menyetujui"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">KOBI Menyetujui</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Memvalidasi margin yang menguntungkan dan mengunci keunggulan bersaing toko Anda.
              </p>
            </div>
            <Link
              href="/konsultasi"
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2 hover:underline"
            >
              <span>Terapkan Action Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: FINAL CTA BANNER (WITH APPROVE MASCOT)
          ============================================================ */}
      <section className="mt-24 sm:mt-32 max-w-5xl mx-auto px-4 pb-8">
        <div className="relative overflow-hidden rounded-3xl precedent-pill p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl -z-10"
          />

          <div className="space-y-4 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Bebas Biaya & Tanpa Login Toko
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Siap Menemukan Harga Paling Menguntungkan untuk Toko Anda?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Mulai audit etalase pertama Anda hari ini. Ekstraksi data selesai dalam 3 detik, lengkap dengan visualizer sweet-spot dan action plan 30 hari.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/konsultasi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <span>Mulai Konsultasi Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tanya"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all"
              >
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Buka Tanya KOBI</span>
              </Link>
            </div>
          </div>

          {/* Right Big Mascot Approve */}
          <div className="w-52 sm:w-64 h-52 sm:h-64 flex-shrink-0 relative">
            <Image
              src="/brand/mascot/mascot-approve.png"
              alt="KOBI Maskot Sukses"
              width={280}
              height={280}
              className="w-full h-full object-contain filter drop-shadow-xl animate-float-slow"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
