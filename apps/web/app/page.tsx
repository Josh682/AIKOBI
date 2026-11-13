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
    <div className="py-4 sm:py-8 overflow-hidden">
      {/* ============================================================
          SECTION 1: HERO SECTION (PRECEDENT: PEDESTAL & KOBI MASCOT)
          ============================================================ */}
      <section className="relative text-center max-w-6xl mx-auto pt-4 sm:pt-10">
        {/* Soft Ambient Light Glow Behind Mascot */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 -z-10 w-[340px] sm:w-[620px] h-[340px] sm:h-[620px] rounded-full bg-radial from-blue-400/20 via-indigo-500/10 to-transparent blur-3xl opacity-80"
        />

        {/* Operational Beacon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Platform Riset Pasar & Konsultan Harga Tokopedia Real-Time</span>
        </div>

        {/* Precedent Editorial Typography: Sans-serif + Italic Serif */}
        <div className="space-y-1 sm:space-y-2 max-w-4xl mx-auto px-2">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Kuasai Strategi & Margin
          </h1>
          <p className="font-editorial text-3xl sm:text-5xl lg:text-6xl text-blue-600 dark:text-blue-400 tracking-normal leading-[1.2]">
            Etalase Marketplace Anda
          </p>
        </div>

        {/* Subtitle Description */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
          AIKOBI bertindak layaknya konsultan bisnis profesional bagi UMKM Indonesia—mengungkap posisi harga pasar ideal (*Sweet-Spot*), membongkar sentimen ulasan pembeli, hingga memenangkan ongkir logistik lokal.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 px-4">
          <Link
            href="/konsultasi"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all"
          >
            <span>Mulai Konsultasi Bisnis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tanya"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border border-slate-300/80 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm precedent-pill transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Tanya KOBI (Chatbot AI)</span>
          </Link>
        </div>

        {/* Center Stage: 3D Fluted Pedestal + Mascot & Floating Glass Pills */}
        <div className="relative mt-12 sm:mt-16 pt-6 flex flex-col items-center justify-center">
          {/* Left Floating Glass Pill (Matches Precedent) */}
          <div className="hidden lg:flex absolute left-4 xl:left-8 top-16 z-20 w-72 p-4 rounded-2xl precedent-pill text-left space-y-2 animate-float-slow transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">Sensor Tokopedia</h2>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Live Ingestion Engine</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Ekstraksi otomatis etalase kompetitor, varian multi-ukuran (S/M/L), serta pemisahan eceran vs grosir tanpa login.
            </p>
          </div>

          {/* Right Floating Glass Pill (Matches Precedent) */}
          <div className="hidden lg:flex absolute right-4 xl:right-8 top-16 z-20 w-72 p-4 rounded-2xl precedent-pill text-left space-y-2 animate-float-reverse transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">Model Kuantil</h2>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Sweet-Spot Pricing</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Penentuan zona harga wajar konsensus pasar untuk memaksimalkan omzet toko dan mencegah perang harga rugi.
            </p>
          </div>

          {/* Mascot Figure Sitting/Standing on Pedestal */}
          <div className="relative z-10 w-64 sm:w-80 h-72 sm:h-96 flex items-end justify-center">
            <Image
              src="/brand/mascot/mascot-greeting.png"
              alt="KOBI Maskot Konsultan Bisnis"
              width={420}
              height={420}
              priority
              className="w-auto h-full object-contain filter drop-shadow-[0_20px_30px_rgba(15,23,42,0.18)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] animate-float-slow"
            />
          </div>

          {/* 3D Fluted Circular Pedestal Disc Cap */}
          <div className="relative -mt-6 sm:-mt-8 z-20 w-72 sm:w-96 h-14 sm:h-16 rounded-[100%] pedestal-cap flex items-center justify-center shadow-lg">
            <div className="w-56 sm:w-72 h-8 sm:h-10 rounded-[100%] bg-slate-200/50 dark:bg-slate-700/40 blur-xs" />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: FLUTED ARCHITECTURAL PEDESTAL SPINE (UNBROKEN CONTINUOUS)
          ============================================================ */}
      <section className="relative max-w-5xl mx-auto px-4 pt-20 sm:pt-28 pb-12 sm:pb-20">
        {/* Central Vertical Fluted Spine Column (Flows continuously without interruption from under the Disc Cap) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-12 sm:-top-16 bottom-0 -translate-x-1/2 w-64 sm:w-80 md:w-96 fluted-pedestal rounded-b-3xl border-x border-slate-300/80 dark:border-slate-700 opacity-90 dark:opacity-85 -z-10 shadow-lg"
        />

        {/* Section Heading Centered Across the Fluted Column */}
        <div className="relative text-center max-w-xl mx-auto mb-16 sm:mb-24 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700 mb-2">
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
