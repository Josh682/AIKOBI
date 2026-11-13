'use client';

import React from 'react';
import Image from 'next/image';
import {
  Scale,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  ShieldCheck,
} from 'lucide-react';

export interface SweetSpotVisualizerProps {
  data: {
    produk: string;
    kategori: string;
    harga_toko: number;
    harga_pasar: number;
    status: string;
    confidence: number;
    rekomendasi: string;
    rentang_harga_wajar?: {
      min?: number;
      max?: number;
      min_pasar?: number;
      max_pasar?: number;
      wajar_min?: number;
      wajar_max?: number;
      harga_toko?: number;
      harga_pasar?: number;
      is_inside_zone?: boolean;
      status_zone?: string;
      ml_source?: string;
    };
    info_varian?: {
      ada_varian: boolean;
      harga_default?: number;
      min_varian: number;
      max_varian: number;
      total_varian: number;
      catatan: string;
    } | null;
  };
  className?: string;
}

export function AikobiSweetSpotVisualizer({ data, className = '' }: SweetSpotVisualizerProps) {
  const rhw = data.rentang_harga_wajar || {};
  const minP = rhw.min_pasar ?? rhw.min ?? data.harga_toko;
  const maxP = rhw.max_pasar ?? rhw.max ?? data.harga_toko;
  const wMin = rhw.wajar_min ?? Math.round(data.harga_pasar * 0.85);
  const wMax = rhw.wajar_max ?? Math.round(data.harga_pasar * 1.15);
  const shopP = data.harga_toko;
  const meanP = data.harga_pasar;

  // Scale bounds for progress track visualization (clamped between 8% and 92% to avoid edge overflow)
  const totalRange = maxP - minP || 1;
  const getPct = (val: number) => Math.min(92, Math.max(8, ((val - minP) / totalRange) * 100));

  const shopPct = getPct(shopP);
  const meanPct = getPct(meanP);
  const wMinPct = Math.min(90, Math.max(6, ((wMin - minP) / totalRange) * 100));
  const wMaxPct = Math.min(94, Math.max(10, ((wMax - minP) / totalRange) * 100));

  // Determine status presentation
  const isMurah = data.status === 'murah';
  const isMahal = data.status === 'mahal';
  const isWajar = !isMurah && !isMahal;

  const statusBadge = isMurah
    ? {
        label: 'Harga Kompetitif (Hemat)',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-500/30',
        icon: CheckCircle2,
      }
    : isMahal
    ? {
        label: 'Harga Premium',
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-500/30',
        icon: AlertTriangle,
      }
    : {
        label: 'Sweet-Spot (Ideal)',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-500/30',
        icon: Target,
      };

  const StatusIcon = statusBadge.icon;

  return (
    <section className={`flat-surface p-6 sm:p-8 lg:p-10 space-y-8 shadow-sm ${className}`}>
      {/* 1. Header: Category, Title & Status Badge with Mascot Pointing */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex-shrink-0 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl p-1 border border-amber-200/60 dark:border-amber-900/40">
            <Image
              src="/brand/mascot/mascot-pointing.png"
              alt="KOBI Menunjukkan Arah"
              width={64}
              height={64}
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {data.kategori || 'Katalog Tokopedia'}
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
              {data.produk}
            </h2>
          </div>
        </div>

        <div className="flex-shrink-0 self-start md:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* 2. Trio Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1: Shop Price */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Harga Toko Anda
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            Rp {shopP.toLocaleString('id-ID')}
          </div>
          {data.info_varian && data.info_varian.ada_varian && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 mt-1">
              <Tag className="w-3 h-3 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                {data.info_varian.total_varian} Varian: Rp {data.info_varian.min_varian.toLocaleString('id-ID')} – Rp {data.info_varian.max_varian.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>

        {/* Metric 2: Market Average Price */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Harga Rata-Rata Pasar
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums tracking-tight">
            Rp {meanP.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Dihitung dari 20 etalase kompetitor aktif
          </p>
        </div>

        {/* Metric 3: AI Confidence */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            <span>Confidence AI</span>
            <span className="text-slate-900 dark:text-white font-extrabold">{data.confidence || 82}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, data.confidence || 82))}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Model inferensi kuantil gradient boosted
          </p>
        </div>
      </div>

      {/* 3. Executive Recommendation Callout Note */}
      <div className="p-4 sm:p-5 rounded-xl border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>Sintesis Evaluasi AIKOBI</span>
        </div>
        <p className="text-justify font-normal">{data.rekomendasi}</p>
      </div>

      {/* 4. Interactive Sweet-Spot Range Spectrum */}
      <div className="p-5 sm:p-7 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-6">
        {/* Spectrum Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Rentang Harga Wajar Pasar (Sweet-Spot)
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
              rhw.is_inside_zone
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            {rhw.status_zone || 'Zona Penetapan Harga'}
          </span>
        </div>

        {/* Spectrum Track with Anti-Collision Vertical Pins */}
        <div className="relative pt-12 pb-14 sm:pt-14 sm:pb-16 px-2">
          {/* Main Track Background */}
          <div className="relative h-10 sm:h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            {/* Min Price Text on Far Left */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 z-10 pointer-events-none tabular-nums">
              Rp {minP.toLocaleString('id-ID')}
            </span>

            {/* Max Price Text on Far Right */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 z-10 pointer-events-none tabular-nums">
              Rp {maxP.toLocaleString('id-ID')}
            </span>

            {/* Fair Zone (Sweet-Spot Band) */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-400/80 via-emerald-500/90 to-teal-400/80 dark:from-emerald-600/70 dark:via-emerald-500/80 dark:to-teal-600/70 rounded-full shadow-sm"
              style={{
                left: `${wMinPct}%`,
                width: `${Math.max(10, wMaxPct - wMinPct)}%`,
              }}
            >
              <span className="hidden md:inline-block absolute inset-0 text-center leading-[40px] sm:leading-[48px] text-[10px] font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-100 opacity-70 pointer-events-none">
                Zona Wajar
              </span>
            </div>
          </div>

          {/* Marker 1: Market Average Pin (Anchored UPWARD) */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: `${meanPct}%`, top: '8px', bottom: '16px' }}
          >
            {/* Vertical Line */}
            <div className="w-[3px] h-full bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-sm" />

            {/* Badge anchored UP */}
            <div className="absolute -top-11 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
              Rata-rata: Rp {meanP.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Marker 2: Shop Price Pin (Anchored DOWNWARD) */}
          <div
            className="absolute z-30 pointer-events-none"
            style={{ left: `${shopPct}%`, top: '16px', bottom: '8px' }}
          >
            {/* Vertical Line */}
            <div className="w-[3.5px] h-full bg-slate-900 dark:bg-white rounded-b-full shadow-md" />

            {/* Badge anchored DOWN */}
            <div className="absolute -bottom-12 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white shadow-md">
              Harga Anda: Rp {shopP.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* 3-Column Quantile Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Harga Terendah Pasar
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
              Rp {minP.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-center">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Target Zona Wajar (Sweet-Spot)
            </div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
              Rp {wMin.toLocaleString('id-ID')} – Rp {wMax.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-right">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Harga Tertinggi Pasar
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
              Rp {maxP.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
