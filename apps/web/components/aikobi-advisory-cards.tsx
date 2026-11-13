'use client';

import React from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Star,
  ThumbsUp,
  Lightbulb,
  BarChart3,
  Users,
  Compass,
  ArrowUpRight,
} from 'lucide-react';

export interface AdvisoryCardsProps {
  data: {
    analisis_mendalam?: {
      analisis_harga?: {
        posisi_pasar: string;
        label_selisih: string;
        is_cheaper: boolean;
        selisih_persen: number;
        diff_from_mean: number;
        diff_from_min: number;
        diff_from_max: number;
        min_price: number;
        max_price: number;
        mean_price: number;
        penjelasan_posisi: string;
      };
      analisis_rentang?: {
        terendah: number;
        tertinggi: number;
        rata_rata: number;
        rentang_total: number;
        selisih_dari_terendah: number;
        selisih_dari_tertinggi: number;
        gap_pct_terendah: number;
        penyebab_perbedaan: string[];
        signifikansi_pembeli: {
          tingkat: string;
          analisis: string;
        };
        korelasi_penjualan: {
          kesimpulan: string;
          analisis: string;
        };
      };
      evaluasi_ulasan?: {
        rating_rata: number;
        total_ulasan: number;
        sentimen_positif: number;
        ringkasan_ulasan: string;
        hal_dipuji: string[];
        hal_diperbaiki: string[];
      };
      rekomendasi_penjual?: {
        strategi_harga: Array<{
          nama_opsi: string;
          target_harga: number;
          detail: string;
        }>;
        tindakan_operasional?: string[];
      };
    };
  };
  className?: string;
}

export function AikobiAdvisoryCards({ data, className = '' }: AdvisoryCardsProps) {
  const am = data.analisis_mendalam;
  if (!am) return null;

  const ah = am.analisis_harga;
  const ar = am.analisis_rentang;
  const eu = am.evaluasi_ulasan;
  const rp = am.rekomendasi_penjual;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Asymmetric 60/40 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: 60% Width on Desktop (lg:col-span-7)          */}
        {/* Focus on Financial Position, Strategic Options, Action Plan*/}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Card 1: Market Price Position Analysis with Mascot Thinking */}
          {ah && (
            <div className="flat-surface p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 relative flex-shrink-0 bg-purple-50/80 dark:bg-purple-950/30 rounded-xl p-0.5 border border-purple-200/60 dark:border-purple-900/40">
                    <Image
                      src="/brand/mascot/mascot-thinking.png"
                      alt="KOBI Menganalisis"
                      width={44}
                      height={44}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                      Posisi Harga Pasar
                    </h3>
                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                      Analisis Disparitas Kompetitor
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    ah.is_cheaper
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  }`}
                >
                  {ah.posisi_pasar}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                {ah.penjelasan_posisi}
              </p>

              {/* 3 Benchmarking Rows */}
              <div className="space-y-2.5 pt-1">
                {/* Benchmark vs Mean */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Vs Rata-Rata Pasar (Rp {ah.mean_price?.toLocaleString('id-ID')})
                  </span>
                  <span
                    className={`font-black tabular-nums ${
                      ah.is_cheaper ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {ah.label_selisih}
                  </span>
                </div>

                {/* Benchmark vs Min */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Vs Harga Terendah (Rp {ah.min_price?.toLocaleString('id-ID')})
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
                    +Rp {ah.diff_from_min?.toLocaleString('id-ID')} di atas Terendah
                  </span>
                </div>

                {/* Benchmark vs Max */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Vs Harga Tertinggi (Rp {ah.max_price?.toLocaleString('id-ID')})
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
                    -Rp {ah.diff_from_max?.toLocaleString('id-ID')} di bawah Tertinggi
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Strategic Pricing Options & Operational Action Plan with Mascot Approve */}
          {rp && (
            <div className="flat-surface p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 relative flex-shrink-0 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl p-0.5 border border-emerald-200/60 dark:border-emerald-900/40">
                  <Image
                    src="/brand/mascot/mascot-approve.png"
                    alt="KOBI Menyetujui"
                    width={44}
                    height={44}
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                    Rekomendasi Strategis & Action Plan Penjual
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Validasi skenario optimasi harga & tindakan taktis yang disetujui konsultan KOBI
                  </p>
                </div>
              </div>

              {/* Pricing Strategy Options */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Skenario Penetapan Harga:</span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {rp.strategi_harga?.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-xl border transition-all ${
                        idx === 0
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{opt.nama_opsi}</span>
                          {idx === 0 && (
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white tracking-wide">
                              Pilihan Utama
                            </span>
                          )}
                        </div>
                        <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 tabular-nums whitespace-nowrap">
                          Target: Rp {opt.target_harga?.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2 text-justify">
                        {opt.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 30-Day Operational Action Steps */}
              {rp.tindakan_operasional && rp.tindakan_operasional.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Langkah Taktis 30 Hari:</span>
                  </div>
                  <div className="space-y-2">
                    {rp.tindakan_operasional.map((tindakan, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {tindakan}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Deep Market Sensitivity Analysis */}
          {ar && (
            <div className="flat-surface p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    Sensitivitas Permintaan & Celah Kompetitor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mengapa kompetitor menjual lebih mahal atau lebih murah di Tokopedia
                  </p>
                </div>
              </div>

              {/* Causes of price differences */}
              {ar.penyebab_perbedaan && ar.penyebab_perbedaan.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Akar Penyebab Perbedaan Harga Kompetitor:
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {ar.penyebab_perbedaan.map((p, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customer sensitivity & sales correlation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {ar.signifikansi_pembeli && (
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Signifikansi bagi Pembeli:</span>
                    </div>
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                      {ar.signifikansi_pembeli.tingkat}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                      {ar.signifikansi_pembeli.analisis}
                    </p>
                  </div>
                )}

                {ar.korelasi_penjualan && (
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Korelasi Harga vs Penjualan:</span>
                    </div>
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      {ar.korelasi_penjualan.kesimpulan}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                      {ar.korelasi_penjualan.analisis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 40% Width on Desktop (lg:col-span-5)        */}
        {/* Focus on Buyer Reviews, Praise and Complaints             */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          {eu && (
            <div className="flat-surface p-6 sm:p-8 space-y-6 shadow-sm sticky top-24">
              {/* Header with Star Rating and Satisfaction % */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    Evaluasi Ulasan Pembeli
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  <span>★ {(eu.rating_rata || 4.8).toFixed(1)}</span>
                  <span>({eu.sentimen_positif || 95}% Puas)</span>
                </div>
              </div>

              {/* Review Synthesis Summary */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                {eu.ringkasan_ulasan}
              </p>

              {/* Green Card: Hal yang Dipuji Pembeli */}
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  <span>Hal yang Dipuji Pembeli:</span>
                </div>

                <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-300 leading-relaxed">
                  {eu.hal_dipuji && eu.hal_dipuji.length > 0 ? (
                    eu.hal_dipuji.map((puji, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-justify">{puji}</span>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-slate-500">Belum ada ulasan spesifik.</li>
                  )}
                </ul>
              </div>

              {/* Amber Card: Sarana Perbaikan / Antisipasi Komplain */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <span>Sarana Perbaikan & Antisipasi:</span>
                </div>

                <ul className="space-y-2 text-xs text-amber-950 dark:text-amber-300 leading-relaxed">
                  {eu.hal_diperbaiki && eu.hal_diperbaiki.length > 0 ? (
                    eu.hal_diperbaiki.map((perbaikan, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-justify">{perbaikan}</span>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-slate-500">Tidak ada komplain mayor yang terdeteksi.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
